import {
  addLiquidity,
  createPool,
  Pool,
  removeLiquidity,
  swap,
  poolExists,
  getPoolId,
} from "@/lib/amm";
import {
  AppConfig,
  openContractCall,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { PostConditionMode } from "@stacks/transactions";
import { useEffect, useState } from "react";

const appDetails = {
  name: "Full Range AMM",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

export function useStacks() {
  const [userData, setUserData] = useState<UserData | null>(null);

  const appConfig = new AppConfig(["store_write"]);
  const userSession = new UserSession({ appConfig });

  function connectWallet() {
    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  }

  function disconnectWallet() {
    userSession.signUserOut();
    setUserData(null);
  }

  async function handleCreatePool(token0: string, token1: string, fee: number) {
    try {
      if (!userData) throw new Error("User not connected");
      const options = await createPool(token0, token1, fee);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent create pool transaction");
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      window.alert(err.message);
      return;
    }
  }

  async function handleSwap(pool: Pool, amount: number, zeroForOne: boolean) {
    try {
      if (!userData) throw new Error("User not connected");
      const options = await swap(pool, amount, zeroForOne);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent swap transaction");
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      window.alert(err.message);
      return;
    }
  }

  async function handleAddLiquidity(
    pool: Pool,
    amount0: number,
    amount1: number
  ) {
    try {
      if (!userData) throw new Error("User not connected");
      const options = await addLiquidity(pool, amount0, amount1);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent add liquidity transaction");
          console.log({ data });
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      window.alert(err.message);
      return;
    }
  }

  async function handleRemoveLiquidity(pool: Pool, liquidity: number) {
    try {
      if (!userData) throw new Error("User not connected");
      const options = await removeLiquidity(pool, liquidity);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent remove liquidity transaction");
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      window.alert(err.message);
      return;
    }
  }

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  return {
    userData,
    handleCreatePool,
    handleSwap,
    handleAddLiquidity,
    handleRemoveLiquidity,
    connectWallet,
    disconnectWallet,
  };
}

export function usePoolExists(poolId: string | null) {
  const [exists, setExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkExists = async () => {
    if (!poolId) {
      setExists(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await poolExists(poolId);
      setExists(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setExists(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkExists();
  }, [poolId]);

  return {
    exists,
    loading,
    error,
    refetch: checkExists,
  };
}



export function usePoolExistsByTokens(
  token0: string | null,
  token1: string | null,
  fee: number | null
) {
  const [exists, setExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolId, setPoolId] = useState<string | null>(null);

  const checkExists = async () => {
    if (!token0 || !token1 || fee === null) {
      setExists(null);
      setLoading(false);
      setError(null);
      setPoolId(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const calculatedPoolId = await getPoolId(token0, token1, fee);
      if (!calculatedPoolId) {
        throw new Error("Failed to calculate pool ID");
      }

      setPoolId(calculatedPoolId);
      const result = await poolExists(calculatedPoolId);
      setExists(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setExists(null);
      setPoolId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkExists();
  }, [token0, token1, fee]);

  return {
    exists,
    loading,
    error,
    poolId,
    refetch: checkExists,
  };
}
