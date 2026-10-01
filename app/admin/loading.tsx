import { Skeleton } from "@/components/admin/primitives";
import "./admin.css";
export default function AdminLoading() {
  return (
    <div className="admin-auth" aria-busy="true">
      <div style={{ width: "min(920px,100%)" }}>
        <Skeleton metrics />
        <Skeleton />
      </div>
    </div>
  );
}
