# 1). I created a read function that allows users check if a Pool exist by Id:

(define-read-only (pool-exists (pool-id (buff 20)))
    (ok (is-some (map-get? pools pool-id)))
)




# 2). I also created a Test function that checks the correctness of my contract function:

I checked for pool ID before existence,
I checked for pool ID after existence.
I checked for the boolean return value if a different ID used with 2 different token params in respect to the consensus.


  it("should check if pool exists", () => {
    const { result: poolId } = getPoolId();
    const poolExistsBeforeCreation = simnet.callReadOnlyFn(
      "amm",
      "pool-exists",
      [poolId],
      alice
    );
    expect(poolExistsBeforeCreation.result).toBeOk(Cl.bool(false));

    createPool();

    
    const poolExistsAfterCreation = simnet.callReadOnlyFn(
      "amm",
      "pool-exists",
      [poolId],
      alice
    );
    expect(poolExistsAfterCreation.result).toBeOk(Cl.bool(true));



    const differentPoolId = simnet.callReadOnlyFn(
      "amm",
      "get-pool-id",
      [
        Cl.tuple({
          "token-0": mockTokenOne,
          "token-1": mockTokenTwo,
          fee: Cl.uint(1000), 
        }),
      ],,
      alice
    );
    
    const differentPoolExists = simnet.callReadOnlyFn(
      "amm",
      "pool-exists",
      [differentPoolId.result],
      alice
    );
    expect(differentPoolExists.result).toBeOk(Cl.bool(false));
  });
});


# 3). I got the contract Instances then sent them to the hooks for state management and change which is then passed to the components where users can interact with it.


export async function poolExists(poolId: string): Promise<boolean> {
  try {
    // Convert hex string to Buffer for the contract call
    const poolIdBuffer = Buffer.from(poolId, "hex");
    
    const poolExistsResult = await fetchCallReadOnlyFunction({
      contractAddress: AMM_CONTRACT_ADDRESS,
      contractName: AMM_CONTRACT_NAME,
      functionName: "pool-exists",
      functionArgs: [bufferCV(poolIdBuffer)],
      senderAddress: AMM_CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    if (poolExistsResult.type !== "ok") return false;
    if (poolExistsResult.value.type !== "bool") return false;
    return poolExistsResult.value.value;
  } catch (error) {
    console.error("Error checking if pool exists:", error);
    return false;
  }
}

// Helper function to get pool ID from pool info
export async function getPoolId(token0: string, token1: string, fee: number): Promise<string | null> {
  try {
    // Ensure correct token ordering
    const token0Hex = cvToHex(principalCV(token0));
    const token1Hex = cvToHex(principalCV(token1));
    if (token0Hex > token1Hex) {
      [token0, token1] = [token1, token0];
    }

    const poolIdResult = await fetchCallReadOnlyFunction({
      contractAddress: AMM_CONTRACT_ADDRESS,
      contractName: AMM_CONTRACT_NAME,
      functionName: "get-pool-id",
      functionArgs: [
        Cl.tuple({
          "token-0": principalCV(token0),
          "token-1": principalCV(token1),
          fee: uintCV(fee),
        }),
      ],
      senderAddress: AMM_CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });

    if (poolIdResult.type !== "buffer") return null;
    return poolIdResult.value;
  } catch (error) {
    console.error("Error getting pool ID:", error);
    return null;
  }
}
