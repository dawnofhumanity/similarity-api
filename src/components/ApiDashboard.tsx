import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDistance } from "date-fns";
import LargeHeading from "@/ui/LargeHeading";
import Paragraph from "@/ui/Paragraph";
import { Input } from "@/ui/Input";
import Table from "@/components/Table";

const ApiDashboard = async ({}) => {
  const user = await getServerSession(authOptions);
  if (!user) notFound();

  const apiKeys = await db.apiKey.findMany({
    where: {
      userId: user.user.id,
    },
  });

  const activeApiKey = apiKeys.find((apiKey) => apiKey.enabled);

  if (!activeApiKey) notFound();

  const userRequests = await db.apiRequest.findMany({
    where: {
      apiKeyId: {
        in: apiKeys.map((key) => key.id),
      },
    },
  });

  const serializableRequests = userRequests.map((req) => ({
    ...req,
    timestamp: formatDistance(new Date(req.timestamp), new Date()),
  }));

  return (
    <div className={"container flex flex-col gap-6"}>
      <LargeHeading>Welcome back, {user.user.name}</LargeHeading>
      <div
        className={
          "flex flex-col items-center justify-center gap-4 md:flex-row md:justify-start"
        }
      >
        <Paragraph>Your API key:</Paragraph>
        <Input className={"w-fit truncate"} readOnly value={activeApiKey.key} />
      </div>

      <Paragraph className={"text-center md:text-left mt-4 -mb-4"}>
        Your API history:
      </Paragraph>

      <Table userRequests={serializableRequests} />
    </div>
  );
};

export default ApiDashboard;
