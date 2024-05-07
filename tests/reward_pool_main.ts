import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardPoolMain } from "../target/types/reward_pool_main";
import { assert } from "chai";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";
import { Keypair, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";

// Función para realizar el airdrop
async function airdrop(connection, pubkey) {
  const airdropSignature = await connection.requestAirdrop(pubkey, 1e9); // 1 SOL
  await connection.confirmTransaction(airdropSignature, "confirmed");
}

describe("reward_pool_main", () => {
  const provider = anchor.AnchorProvider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);

  const connection = provider.connection;
  const wallet = provider.wallet;
  const program = anchor.workspace.RewardPoolMain as Program<RewardPoolMain>;

  const rewardPoolKp = Keypair.generate();
  const taxRecipientKp = Keypair.generate();
  const campaignTokenKp = Keypair.generate();

  // const taxRecipientAccount = anchor.web3.Keypair.generate();
  // const campaignTokenAccount = anchor.web3.Keypair.generate();

  // let campaignMint;
  // let campaignTokenAccount;
  // let taxRecipientAccount;

  it("Initializes the reward pool", async () => {
    // Asegurarse de que el `wallet` tiene fondos suficientes
    await airdrop(connection, wallet.publicKey);

    // Ejecutar la transacción de inicialización para crear la cuenta de Reward Pool
    await program.methods
      .initialize()
      .accounts({
        rewardPool: rewardPoolKp.publicKey, // Nueva cuenta de Reward Pool
        user: wallet.publicKey, // Firmante principal
        systemProgram: SystemProgram.programId,
      })
      .signers([rewardPoolKp]) // Firmar para inicializar la cuenta
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
  });

  // Depósito de recompensas en el Reward Pool
    it("Deposits rewards correctly", async () => {
      // Generar el PDA para `reward_info`
      const [rewardInfoPda] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("rewardInfoPda")],
        program.programId
      );
      const [campaignTokenAccount] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("campaignTokenAccount")],
        program.programId
      );
      const [taxRecipientAccount] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("taxRecipientAccount")],
        program.programId
      );

      // Definir los valores de la campaña y las tarifas
      const campaignAmount = new BN(500);
      const feeAmount = new BN(50);
      const campaignId = new BN(1);

      // Asegurarse de que `taxRecipientAccount` esté correctamente inicializado
      assert.ok(taxRecipientAccount, "La cuenta taxRecipientAccount no está definida");

      // Ejecutar el método `depositReward`
      await program.methods
        .depositReward(campaignTokenAccount, campaignAmount, feeAmount, campaignId)
        .accounts({
          rewardPool: rewardPoolKp.publicKey,
          user: wallet.publicKey,
          taxRecipientAccount: taxRecipientAccount,
          campaignTokenAccount: campaignTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          rewardInfo: rewardInfoPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([rewardPoolKp]) // Firmar solo con el Keypair necesario
        .rpc();

      // Verificar que el depósito se realizó correctamente
      const rewardInfoAccount = await program.account.rewardInfo.fetch(rewardInfoPda);
      assert.strictEqual(rewardInfoAccount.amount.toNumber(), campaignAmount.toNumber(), "El monto no coincide");
      assert.strictEqual(rewardInfoAccount.tokenAddress.toBase58(), campaignTokenAccount.toBase58(), "La cuenta de la campaña no coincide");
      assert.strictEqual(rewardInfoAccount.ownerAddress.toBase58(), wallet.publicKey.toBase58(), "El propietario no coincide");
    });
});
