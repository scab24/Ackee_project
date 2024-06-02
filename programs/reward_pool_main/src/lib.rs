
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{self, Mint, Token, TokenAccount, Transfer}};
use solana_program::pubkey::Pubkey;

declare_id!("3pCyA3bZvZABQykEPfCtfd8U6fgV7pxajBi1ZVGZjQqu");

#[program]
pub mod reward_pool_main {
    use super::*;

    pub fn initialize(ctx: Context<InitializePool>) -> Result<()> {
        let reward_pool: &mut Account<RewardPoolState> = &mut ctx.accounts.reward_pool;
        reward_pool.tax_recipient = ctx.accounts.user.key();
        reward_pool.creator = ctx.accounts.user.key();
        reward_pool.token_mint = ctx.accounts.pool_token_mint.key();
        reward_pool.bump = ctx.bumps.reward_pool;
        Ok(())
    }

    pub fn deposit_reward(
        ctx: Context<DepositReward>, 
        token_address: Pubkey, 
        campaign_amount: u64,
        _fee_amount: u64,
        campaign_id: u64
    ) -> Result<()> {
        let reward_info = &mut ctx.accounts.reward_info;

        let transfer_campaign_ix = Transfer {
            from: ctx.accounts.depositer_token_account.to_account_info(),
            to: ctx.accounts.campaign_token_account.to_account_info(),
            authority: ctx.accounts.depositer.to_account_info(),
        };
        
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_campaign_ix
            ),
            campaign_amount,
        )?;

        reward_info.token_address = token_address;
        reward_info.amount = reward_info.amount.checked_add(campaign_amount).ok_or(ErrorCode::ArithmeticError)?;
        reward_info.owner_address = *ctx.accounts.depositer.key;
        reward_info.campaign_id = campaign_id;
        reward_info.bump = ctx.bumps.reward_info;

        Ok(())
    }

    pub fn claim_reward(
        ctx: Context<ClaimReward>, 
        campaign_id: u64, 
        amount: u64
    ) -> Result<()> {
        let reward_info = &mut ctx.accounts.reward_info;
        let user_claim_info = &mut ctx.accounts.user_claim_info;

        if ctx.accounts.reward_pool.paused {
            return Err(ErrorCode::ProgramPaused.into());
        }

        if reward_info.amount < amount {
            return Err(ErrorCode::NotEnoughReward.into());
        }

        if user_claim_info.campaign_id != reward_info.campaign_id {
            return Err(ErrorCode::UnauthorizedCampaignId.into());
        }

        if user_claim_info.claimed_amount + amount > reward_info.amount {
            return Err(ErrorCode::ClaimAmountExceedsAllowedBalance.into());
        }

        user_claim_info.claimed_amount = user_claim_info.claimed_amount.checked_add(amount).ok_or(ErrorCode::ArithmeticError)?;

        reward_info.amount = reward_info.amount.checked_sub(amount).ok_or(ErrorCode::ArithmeticError)?;

        let seeds = &[
            b"reward_pool".as_ref(),
            ctx.accounts.reward_pool.creator.as_ref(),
            &[ctx.accounts.reward_pool.bump]
        ];

        let transfer_reward_ix = Transfer {
            from: ctx.accounts.campaign_token_account.to_account_info(),
            to: ctx.accounts.user_vault.to_account_info(), 
            authority: ctx.accounts.reward_pool.to_account_info()
        };
        
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_reward_ix,
                &[&seeds[..]]
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn pause(ctx: Context<Pause>) -> Result<()> {
        let reward_pool = &mut ctx.accounts.reward_pool;
        reward_pool.paused = true;
        Ok(())
    }

    pub fn unpause(ctx: Context<Unpause>) -> Result<()> {
        let reward_pool = &mut ctx.accounts.reward_pool;
        reward_pool.paused = false;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 32 + 32 + 1,
        seeds = [b"reward_pool".as_ref(), user.key().as_ref()],
        bump
    )]
    pub reward_pool: Account<'info, RewardPoolState>,
    
    pub pool_token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = user, 
        associated_token::mint = pool_token_mint,
        associated_token::authority = reward_pool
    )]
    pub pool_token_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(campaign_id: u64)]
pub struct DepositReward<'info> {
    pub pool_token_mint: Account<'info, Mint>,

    #[account(
        mut, 
        seeds = [b"reward_pool".as_ref(), reward_pool.creator.as_ref()],
        bump = reward_pool.bump
    )]
    pub reward_pool: Account<'info, RewardPoolState>,

    #[account(
        init_if_needed,
        payer = depositer,
        associated_token::mint = pool_token_mint, 
        associated_token::authority = depositer
    )]
    pub depositer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = pool_token_mint, 
        associated_token::authority = reward_pool
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = depositer,
        seeds = [b"reward_info".as_ref(), depositer.key().as_ref(), campaign_id.to_le_bytes().as_ref()],
        bump,
        space = 8 + 32 + 32 + 8 + 1
    )]
    pub reward_info: Account<'info, RewardInfo>,

    #[account(mut)]
    pub depositer: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(campaign_id: u64)]
pub struct ClaimReward<'info> {
    pub pool_token_mint: Account<'info, Mint>,

    #[account(
        mut, 
        seeds = [b"reward_pool".as_ref(), reward_pool.creator.as_ref()],
        bump = reward_pool.bump
    )]
    pub reward_pool: Account<'info, RewardPoolState>,   

    #[account(
        mut,
        associated_token::mint = pool_token_mint, 
        associated_token::authority = claimer.key()
    )]
    pub user_vault: Account<'info, TokenAccount>, 

    #[account(
        mut,
        associated_token::mint = pool_token_mint, 
        associated_token::authority = reward_pool
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"reward_info", claimer.key().as_ref(), campaign_id.to_le_bytes().as_ref()],
        bump = reward_info.bump
    )]
    pub reward_info: Account<'info, RewardInfo>,

    #[account(
        init_if_needed,
        payer = claimer,
        space = 8 + 8,
        seeds = [b"user_claim_info", claimer.key().as_ref(), campaign_id.to_le_bytes().as_ref()],
        bump
    )]
    pub user_claim_info: Account<'info, UserClaimInfo>,

    pub token_program: Program<'info, Token>, 
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub claimer: Signer<'info>,
}

#[derive(Accounts)]
pub struct Pause<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [b"reward_pool".as_ref(), reward_pool.creator.as_ref()],
        bump = reward_pool.bump
    )]
    pub reward_pool: Account<'info, RewardPoolState>,
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct Unpause<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [b"reward_pool".as_ref(), reward_pool.creator.as_ref()],
        bump = reward_pool.bump
    )]
    pub reward_pool: Account<'info, RewardPoolState>,
    pub creator: Signer<'info>,
}

#[account]
pub struct RewardPoolState {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub tax_recipient: Pubkey,
    pub paused: bool,
    pub bump: u8,
}

#[account]
pub struct RewardInfo {
    pub token_address: Pubkey,
    pub owner_address: Pubkey,
    pub amount: u64,
    pub campaign_id: u64,
    pub bump: u8,
}

#[account]
pub struct UserClaimInfo {
    pub claimed_amount: u64,
    pub campaign_id: u64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Not enough reward in the pool.")]
    NotEnoughReward,
    #[msg("Program is paused")]
    ProgramPaused,
    #[msg("Unauthorized campaign id")]
    UnauthorizedCampaignId,
    #[msg("Arithmetic operation failed")]
    ArithmeticError,
    #[msg("Claim amount exceeds allowed balance")]
    ClaimAmountExceedsAllowedBalance,
}
