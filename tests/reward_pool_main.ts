import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardPoolMain } from "../target/types/reward_pool_main";
import { assert } from "chai";

// import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
// import BN from "bn.js";


// Airdrop function
async function airdrop(connection, pubkey) {
  const airdropSignature = await connection.requestAirdrop(pubkey, 1e9); // 1 SOL
  await connection.confirmTransaction(airdropSignature, "confirmed");
}

describe("reward_pool_main", () => {
  const provider = anchor.AnchorProvider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);

  const connection = provider.connection;
  const wallet = provider.wallet;
  const walletFake = anchor.web3.Keypair.generate();
  const program = anchor.workspace.RewardPoolMain as Program<RewardPoolMain>;
  const vault = anchor.web3.Keypair.generate();

  it("Initializes the reward pool", async () => {
    // Airdrop al monedero principal para asegurarse de que tiene fondos suficientes
    await airdrop(connection, wallet.publicKey);

    // Encontrar la dirección programática para `token` y `reward_pool`
    const [tokenPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token")],
      program.programId
    );
    const [rewardPoolPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("reward_pool")],
      program.programId
    );

    // Generar una nueva clave para la cuenta de Reward Pool
    const rewardPoolKp = anchor.web3.Keypair.generate();

    // Enviar la transacción de inicialización para crear la cuenta de recompensa
    await program.methods
      .initialize()
      .accounts({
        rewardPool: rewardPoolKp.publicKey, // Nueva cuenta de Reward Pool
        user: wallet.publicKey, // Firmante principal
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([rewardPoolKp]) // Se firma para inicializar la cuenta
      .rpc();

    // Recuperar la cuenta recién creada para verificar su estado
    const rewardPoolAccount = await program.account.rewardPoolState.fetch(rewardPoolKp.publicKey);

    // Verificar que la cuenta tenga los valores correctos
    assert.strictEqual(
      rewardPoolAccount.owner.toBase58(),
      wallet.publicKey.toBase58(),
      "Propietario incorrecto"
    );
    assert.strictEqual(
      rewardPoolAccount.taxRecipient.toBase58(),
      wallet.publicKey.toBase58(),
      "Beneficiario de impuestos incorrecto"
    );

    // Verificar que el campo `authorizedSigner` esté inicializado con un valor predeterminado
    assert.strictEqual(
    rewardPoolAccount.authorizedSigner.toBase58(),
    anchor.web3.PublicKey.default.toBase58(),
    "El firmante autorizado debería ser la clave pública predeterminada"
    );

    // Verificar que el campo `paused` esté inicializado correctamente
    assert.isFalse(
    rewardPoolAccount.paused,
    "El estado pausado debería ser falso por defecto"
    );

    // Verificar que el campo `vault` esté inicializado (si corresponde)
    console.log("Estado de la cuenta de Reward Pool:", rewardPoolAccount);
  });


  //  // Depósito de recompensas en el Reward Pool
  //  it("Deposits rewards correctly", async () => {
  //   // Airdrop para la cuenta principal para asegurarse de que tiene fondos suficientes
  //   await airdrop(connection, wallet.publicKey);

  //   // Crear un Token Account para la campaña y el receptor de tarifas
  //   const token = new Token(connection, TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, wallet.payer);
  //   const campaignTokenAccount = await token.createAccount(wallet.publicKey);
  //   const taxRecipientAccount = await token.createAccount(wallet.publicKey);

  //   // Generar el PDA para `reward_info`
  //   const [rewardInfoPda] = await anchor.web3.PublicKey.findProgramAddress(
  //     [Buffer.from("reward_info"), Buffer.from("campaign_1")],
  //     program.programId
  //   );

  //   // Definir el monto de la campaña y la tarifa como Big Numbers (BN)
  //   const campaignAmount = new BN(500); // Monto de prueba para la campaña
  //   const feeAmount = new BN(50); // Tarifa para la campaña

  //   // Ejecutar la transacción `depositReward`
  //   await program.methods
  //     .depositReward(campaignTokenAccount, campaignAmount, feeAmount, new BN(1))
  //     .accounts({
  //       rewardPool: rewardPoolKp.publicKey,
  //       user: wallet.publicKey,
  //       taxRecipientAccount: taxRecipientAccount,
  //       campaignTokenAccount: campaignTokenAccount,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       rewardInfo: rewardInfoPda,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .signers([rewardPoolKp])
  //     .rpc();

  //   // Recuperar la cuenta `reward_info` para verificar el depósito
  //   const rewardInfoAccount = await program.account.rewardInfo.fetch(rewardInfoPda);

  //   // Comprobar que el depósito se realizó correctamente
  //   assert.strictEqual(rewardInfoAccount.amount.toNumber(), campaignAmount.toNumber(), "El monto no coincide");
  //   assert.strictEqual(rewardInfoAccount.tokenAddress.toBase58(), campaignTokenAccount.toBase58(), "La cuenta de la campaña no coincide");
  //   assert.strictEqual(rewardInfoAccount.ownerAddress.toBase58(), wallet.publicKey.toBase58(), "El propietario no coincide");
  // });
});
