import { getMyProfile } from "@/actions/employees";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const profile = await getMyProfile();

  if (!profile) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profil Saya</h2>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Profil tidak ditemukan. Hubungi Admin HRD.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profil Saya</h2>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">NIK</p>
          <p className="text-lg font-semibold text-gray-900">{profile.nik}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Departemen</p>
          <p className="text-lg font-semibold text-gray-900">{profile.department?.nama_departemen || "-"}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Jabatan</p>
          <p className="text-lg font-semibold text-gray-900">{profile.position?.nama_jabatan || "-"}</p>
        </div>
      </div>

      {/* Detail & Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detail Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi</h3>
          <div className="space-y-4">
            <DetailItem label="Nama Lengkap" value={profile.nama} />
            <DetailItem label="Email" value={profile.email || "-"} />
            <DetailItem label="No. HP" value={profile.phone || "-"} />
            <DetailItem label="Jenis Kelamin" value={profile.gender || "-"} />
            <DetailItem label="Status" value={profile.status} />
            <DetailItem label="Tanggal Masuk" value={profile.tanggal_masuk} />
          </div>
        </div>

        {/* Edit Phone */}
        <ProfileForm phone={profile.phone || ""} />
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
