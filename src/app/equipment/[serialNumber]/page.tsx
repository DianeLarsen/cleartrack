import { notFound } from "next/navigation";
import { getEquipmentBySerialNumber } from "@/features/equipment/queries";

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ serialNumber: string }>;
}) {
  const { serialNumber } = await params;

  const equipmentItem = await getEquipmentBySerialNumber(serialNumber);

  if (!equipmentItem) {
    notFound();
  }

  return <div>{equipmentItem.serialNumber}</div>;
}
