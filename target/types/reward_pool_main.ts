export type RewardPoolMain = {
  "version": "0.1.0",
  "name": "reward_pool_main",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "depositReward",
      "accounts": [
        {
          "name": "poolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "campaignTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenAddress",
          "type": "publicKey"
        },
        {
          "name": "campaignAmount",
          "type": "u64"
        },
        {
          "name": "feeAmount",
          "type": "u64"
        },
        {
          "name": "campaignId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimReward",
      "accounts": [
        {
          "name": "poolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "campaignTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userClaimInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pause",
      "accounts": [
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "unpause",
      "accounts": [
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "rewardPoolState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "taxRecipient",
            "type": "publicKey"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rewardInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAddress",
            "type": "publicKey"
          },
          {
            "name": "ownerAddress",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "campaignId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userClaimInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claimedAmount",
            "type": "u64"
          },
          {
            "name": "campaignId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotEnoughReward",
      "msg": "Not enough reward in the pool."
    },
    {
      "code": 6001,
      "name": "ProgramPaused",
      "msg": "Program is paused"
    },
    {
      "code": 6002,
      "name": "UnauthorizedCampaignId",
      "msg": "Unauthorized campaign id"
    },
    {
      "code": 6003,
      "name": "ArithmeticError",
      "msg": "Arithmetic operation failed"
    },
    {
      "code": 6004,
      "name": "ClaimAmountExceedsAllowedBalance",
      "msg": "Claim amount exceeds allowed balance"
    }
  ]
};

export const IDL: RewardPoolMain = {
  "version": "0.1.0",
  "name": "reward_pool_main",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "depositReward",
      "accounts": [
        {
          "name": "poolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "campaignTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenAddress",
          "type": "publicKey"
        },
        {
          "name": "campaignAmount",
          "type": "u64"
        },
        {
          "name": "feeAmount",
          "type": "u64"
        },
        {
          "name": "campaignId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimReward",
      "accounts": [
        {
          "name": "poolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "campaignTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userClaimInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "campaignId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pause",
      "accounts": [
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "unpause",
      "accounts": [
        {
          "name": "rewardPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "rewardPoolState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "taxRecipient",
            "type": "publicKey"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rewardInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAddress",
            "type": "publicKey"
          },
          {
            "name": "ownerAddress",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "campaignId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userClaimInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claimedAmount",
            "type": "u64"
          },
          {
            "name": "campaignId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotEnoughReward",
      "msg": "Not enough reward in the pool."
    },
    {
      "code": 6001,
      "name": "ProgramPaused",
      "msg": "Program is paused"
    },
    {
      "code": 6002,
      "name": "UnauthorizedCampaignId",
      "msg": "Unauthorized campaign id"
    },
    {
      "code": 6003,
      "name": "ArithmeticError",
      "msg": "Arithmetic operation failed"
    },
    {
      "code": 6004,
      "name": "ClaimAmountExceedsAllowedBalance",
      "msg": "Claim amount exceeds allowed balance"
    }
  ]
};
