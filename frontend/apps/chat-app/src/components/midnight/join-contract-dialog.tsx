"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "ui/dialog";
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { CheckCircle2 } from "lucide-react";

interface JoinContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinContractDialog({
  open,
  onOpenChange,
}: JoinContractDialogProps) {
  const [contractAddress, setContractAddress] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ address: string } | null>(null);

  const handleJoin = async () => {
    if (!contractAddress) {
      setError("Please enter a contract address");
      return;
    }

    setIsJoining(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Initiating contract join:", { contractAddress });

      // Dynamically import join function to defer WASM loading
      const { joinMidnightContract } = await import(
        "@/lib/midnight/deploy-contract"
      );

      // Join the contract using Midnight SDK
      const result = await joinMidnightContract(contractAddress);

      if (result.success && result.contractAddress) {
        console.log("Contract joined successfully!", {
          address: result.contractAddress,
        });

        setSuccess({
          address: result.contractAddress,
        });

        // Save to localStorage for persistence
        const joinedContracts = JSON.parse(
          localStorage.getItem("joined-midnight-contracts") || "[]",
        );
        joinedContracts.push({
          address: result.contractAddress,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(
          "joined-midnight-contracts",
          JSON.stringify(joinedContracts),
        );

        // Close dialog after showing success for 2 seconds
        setTimeout(() => {
          onOpenChange(false);
          setContractAddress("");
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(result.error || "Join failed with unknown error");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to join contract";
      setError(errorMsg);
      console.error("Contract join error:", err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join Midnight Contract</DialogTitle>
          <DialogDescription>
            Connect to an existing smart contract on the Midnight network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contract-address">Contract Address</Label>
            <Input
              id="contract-address"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter the Midnight contract address you want to interact with
            </p>
          </div>

          {success && (
            <div className="flex items-center gap-2 p-3 border border-green-500/20 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <div>
                <p className="font-medium">Successfully joined contract!</p>
                <p className="text-xs mt-1 font-mono">{success.address}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 border border-red-500/20 bg-red-500/10 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={isJoining || !contractAddress}
            >
              {isJoining ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Joining...
                </>
              ) : (
                "Join Contract"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
