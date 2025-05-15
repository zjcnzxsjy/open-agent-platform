import { createClient } from "@/lib/client";
import { Agent } from "@/types/agent";
import { Assistant } from "@langchain/langgraph-sdk";
import { toast } from "sonner";
import { useAuthContext } from "@/providers/Auth";
import { useCallback } from "react";

export function useAgents() {
  const { session } = useAuthContext();

  const getAgent = useCallback(
    async (
      agentId: string,
      deploymentId: string,
    ): Promise<Agent | undefined> => {
      if (!session?.accessToken) {
        toast.error("No access token found", {
          richColors: true,
        });
        return;
      }
      try {
        const client = createClient(deploymentId, session.accessToken);
        const agent = await client.assistants.get(agentId);
        return { ...agent, deploymentId };
      } catch (e) {
        console.error("Failed to get agent", e);
        toast.error("Failed to get agent");
        return undefined;
      }
    },
    [session?.accessToken],
  );

  const getAgentConfigSchema = useCallback(
    async (agentId: string, deploymentId: string) => {
      if (!session?.accessToken) {
        toast.error("No access token found", {
          richColors: true,
        });
        return;
      }
      try {
        const client = createClient(deploymentId, session.accessToken);
        const schemas = await client.assistants.getSchemas(agentId);

        return schemas.config_schema ?? undefined;
      } catch (e) {
        console.error("Failed to get agent config schema", e);
        toast.error("Failed to get agent config schema", {
          description: (
            <div className="flex flex-col items-start gap-2">
              <p>
                Agent ID:{" "}
                <span className="font-mono font-semibold">{agentId}</span>
              </p>
              <p>
                Deployment ID:{" "}
                <span className="font-mono font-semibold">{deploymentId}</span>
              </p>
            </div>
          ),
          richColors: true,
        });
      }
    },
    [session?.accessToken],
  );

  const createAgent = useCallback(
    async (
      deploymentId: string,
      graphId: string,
      args: {
        name: string;
        description: string;
        config: Record<string, any>;
      },
    ): Promise<Assistant | undefined> => {
      if (!session?.accessToken) {
        toast.error("No access token found", {
          richColors: true,
        });
        return;
      }
      try {
        const client = createClient(deploymentId, session.accessToken);
        const agent = await client.assistants.create({
          graphId,
          metadata: {
            description: args.description,
          },
          name: args.name,
          config: {
            configurable: {
              ...args.config,
            },
          },
        });
        return agent;
      } catch (e) {
        console.error("Failed to create agent", e);
        toast.error("Failed to create agent");
        return undefined;
      }
    },
    [session?.accessToken],
  );

  const updateAgent = useCallback(
    async (
      agentId: string,
      deploymentId: string,
      args: {
        name?: string;
        description?: string;
        config?: Record<string, any>;
      },
    ): Promise<Assistant | undefined> => {
      if (!session?.accessToken) {
        toast.error("No access token found", {
          richColors: true,
        });
        return;
      }
      try {
        const client = createClient(deploymentId, session.accessToken);
        const agent = await client.assistants.update(agentId, {
          metadata: {
            ...(args.description && { description: args.description }),
          },
          ...(args.name && { name: args.name }),
          ...(args.config && { config: { configurable: args.config } }),
        });
        return agent;
      } catch (e) {
        console.error("Failed to update agent", e);
        toast.error("Failed to update agent");
        return undefined;
      }
    },
    [session?.accessToken],
  );

  const deleteAgent = useCallback(
    async (deploymentId: string, agentId: string): Promise<boolean> => {
      if (!session?.accessToken) {
        toast.error("No access token found", {
          richColors: true,
        });
        return false;
      }
      try {
        const client = createClient(deploymentId, session.accessToken);
        await client.assistants.delete(agentId);
        return true;
      } catch (e) {
        console.error("Failed to delete agent", e);
        toast.error("Failed to delete agent");
        return false;
      }
    },
    [session?.accessToken],
  );

  return {
    getAgent,
    getAgentConfigSchema,
    createAgent,
    updateAgent,
    deleteAgent,
  };
}
