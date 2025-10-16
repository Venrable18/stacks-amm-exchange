"use client";

import { usePoolExists, usePoolExistsByTokens } from "@/hooks/use-stacks";
import { useState } from "react";

interface PoolExistsCheckerProps {
  className?: string;
}

export function PoolExistsChecker({ className = "" }: PoolExistsCheckerProps) {
  const [poolId, setPoolId] = useState<string>("");
  const [token0, setToken0] = useState<string>("");
  const [token1, setToken1] = useState<string>("");
  const [fee, setFee] = useState<number>(500);
  const [checkMethod, setCheckMethod] = useState<"poolId" | "tokens">("tokens");

  const poolExistsById = usePoolExists(checkMethod === "poolId" ? poolId : null);
  const poolExistsByTokens = usePoolExistsByTokens(
    checkMethod === "tokens" ? token0 : null,
    checkMethod === "tokens" ? token1 : null,
    checkMethod === "tokens" ? fee : null
  );

  const currentResult = checkMethod === "poolId" ? poolExistsById : poolExistsByTokens;

  return (
    <div className={`p-6 bg-gray-800 rounded-lg ${className}`}>
      <h2 className="text-xl font-bold text-white mb-4">Pool Existence Checker</h2>
      
      {/* Method Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Check Method
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="tokens"
              checked={checkMethod === "tokens"}
              onChange={(e) => setCheckMethod(e.target.value as "tokens")}
              className="mr-2"
            />
            <span className="text-white">By Token Pair & Fee</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="poolId"
              checked={checkMethod === "poolId"}
              onChange={(e) => setCheckMethod(e.target.value as "poolId")}
              className="mr-2"
            />
            <span className="text-white">By Pool ID</span>
          </label>
        </div>
      </div>

      {checkMethod === "tokens" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Token 0 Address
            </label>
            <input
              type="text"
              value={token0}
              onChange={(e) => setToken0(e.target.value)}
              placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-token"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Token 1 Address
            </label>
            <input
              type="text"
              value={token1}
              onChange={(e) => setToken1(e.target.value)}
              placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-token-2"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fee (basis points)
            </label>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              placeholder="500"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {poolExistsByTokens.poolId && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Generated Pool ID
              </label>
              <div className="p-2 bg-gray-700 rounded border border-gray-600 text-white font-mono text-sm break-all">
                {poolExistsByTokens.poolId}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Pool ID (hex)
          </label>
          <input
            type="text"
            value={poolId}
            onChange={(e) => setPoolId(e.target.value)}
            placeholder="Enter pool ID in hex format"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Results */}
      <div className="mt-6 p-4 bg-gray-700 rounded-md">
        <h3 className="text-lg font-semibold text-white mb-2">Result</h3>
        
        {currentResult.loading && (
          <div className="flex items-center text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
            Checking pool existence...
          </div>
        )}

        {currentResult.error && (
          <div className="text-red-400">
            <strong>Error:</strong> {currentResult.error}
          </div>
        )}

        {currentResult.exists !== null && !currentResult.loading && !currentResult.error && (
          <div className={`flex items-center ${currentResult.exists ? 'text-green-400' : 'text-orange-400'}`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${currentResult.exists ? 'bg-green-400' : 'bg-orange-400'}`}></div>
            <span className="font-semibold">
              Pool {currentResult.exists ? 'EXISTS' : 'DOES NOT EXIST'}
            </span>
          </div>
        )}

        {currentResult.exists !== null && (
          <button
            onClick={currentResult.refetch}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

interface PoolStatusIndicatorProps {
  poolId: string | null;
  className?: string;
}

export function PoolStatusIndicator({ poolId, className = "" }: PoolStatusIndicatorProps) {
  const { exists, loading, error } = usePoolExists(poolId);

  if (!poolId) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center text-gray-400 ${className}`}>
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></div>
        <span className="text-xs">Checking...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center text-red-400 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
        <span className="text-xs">Error</span>
      </div>
    );
  }

  if (exists === null) {
    return null;
  }

  return (
    <div className={`flex items-center ${exists ? 'text-green-400' : 'text-gray-400'} ${className}`}>
      <div className={`w-2 h-2 rounded-full mr-1 ${exists ? 'bg-green-400' : 'bg-gray-400'}`}></div>
      <span className="text-xs">{exists ? 'Active' : 'Not Found'}</span>
    </div>
  );
}