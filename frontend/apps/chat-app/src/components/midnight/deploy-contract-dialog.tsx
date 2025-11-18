"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "ui/dialog";
import { Button } from "ui/button";
import { Label } from "ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface DeployContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContractInfo {
  name: string;
  path: string;
  packageName: string;
}

export function DeployContractDialog({
  open,
  onOpenChange,
}: DeployContractDialogProps) {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    address: string;
    txId?: string;
  } | null>(null);

  // Fetch available contracts when dialog opens
  useEffect(() => {
    if (open) {
      fetchContracts();
    }
  }, [open]);

  const fetchContracts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/midnight/contracts");
      if (!response.ok) throw new Error("Failed to fetch contracts");
      const data = await response.json();
      setContracts(data.contracts || []);
      if (data.contracts?.length > 0) {
        setSelectedContract(data.contracts[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contracts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedContract) {
      setError("Please select a contract to deploy");
      return;
    }

    setIsDeploying(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedContractInfo = contracts.find(
        (c) => c.name === selectedContract,
      );

      console.log("Initiating contract deployment:", {
        contract: selectedContractInfo,
        path: selectedContractInfo?.path,
      });

      // Dynamically import deployment function to defer WASM loading
      const { deployMidnightContract } = await import(
        "@/lib/midnight/deploy-contract"
      );

      // Deploy the contract using Midnight SDK
      // This will prompt the user via mnLace wallet extension
      const result = await deployMidnightContract(selectedContract);

      if (result.success && result.contractAddress) {
        console.log("Contract deployed successfully!", {
          address: result.contractAddress,
          txId: result.transactionId,
        });

        setSuccess({
          address: result.contractAddress,
          txId: result.transactionId,
        });

        // Save to localStorage for persistence
        const deployedContracts = JSON.parse(
          localStorage.getItem("deployed-midnight-contracts") || "[]",
        );
        deployedContracts.push({
          name: selectedContract,
          address: result.contractAddress,
          txId: result.transactionId,
          timestamp: new Date().toISOString(),
          packageName: selectedContractInfo?.packageName,
        });
        localStorage.setItem(
          "deployed-midnight-contracts",
          JSON.stringify(deployedContracts),
        );

        // Close dialog after showing success for 2 seconds
        setTimeout(() => {
          onOpenChange(false);
          setSelectedContract("");
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(result.error || "Deployment failed with unknown error");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to deploy contract";
      setError(errorMsg);
      console.error("Contract deployment error:", err);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Deploy Midnight Contract</DialogTitle>
          <DialogDescription>
            Deploy a new smart contract to the Midnight network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Loading contracts...
              </span>
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex items-center gap-2 p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <div className="text-sm">
                <p className="font-medium">No contracts found</p>
                <p className="text-xs mt-1">
                  Compile your Compact contracts first. They should be in{" "}
                  <code className="bg-black/20 px-1 rounded">
                    packages/*/dist/*.compact
                  </code>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="contract-select">Select Contract</Label>
              <Select
                value={selectedContract}
                onValueChange={setSelectedContract}
              >
                <SelectTrigger id="contract-select">
                  <SelectValue placeholder="Choose a contract to deploy" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((contract) => (
                    <SelectItem
                      key={`${contract.packageName}-${contract.name}`}
                      value={contract.name}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{contract.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {contract.packageName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedContract && (
                <p className="text-xs text-muted-foreground">
                  {contracts.find((c) => c.name === selectedContract)?.path}
                </p>
              )}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 border border-green-500/20 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <div>
                <p className="font-medium">Contract deployed successfully!</p>
                <p className="text-xs mt-1 font-mono">{success.address}</p>
                {success.txId && (
                  <p className="text-xs mt-1">Transaction: {success.txId}</p>
                )}
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
              disabled={isDeploying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={
                isDeploying ||
                !selectedContract ||
                isLoading ||
                contracts.length === 0
              }
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Deploying...
                </>
              ) : (
                "Deploy Contract"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
