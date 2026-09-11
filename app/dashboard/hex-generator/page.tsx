import { HexGeneratorTool } from '@/components/tools/hex-generator-tool';
import { requireAdminSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Hex Generator',
};

export default async function HexGeneratorPage() {
  const session = await requireAdminSession();

  return <HexGeneratorTool storageUserId={session.user.id} />;
}
