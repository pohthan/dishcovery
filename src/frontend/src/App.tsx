import { useState } from "react";
import type { Profile } from "@ail/shared";
import { CouponsDemoPage } from "@/pages/CouponsDemoPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ResultsPage } from "@/pages/ResultsPage";
import { loadProfile, saveProfile } from "@/services/profileStorage";
import { useRoute } from "@/utils/hashRoute";

export default function App() {
  const route = useRoute();
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [editing, setEditing] = useState(profile === null);

  if (route === "coupons-demo") return <CouponsDemoPage />;

  if (editing || profile === null) {
    return (
      <ProfilePage
        initial={profile}
        onSave={(p) => {
          saveProfile(p);
          setProfile(p);
          setEditing(false);
        }}
      />
    );
  }
  return <ResultsPage profile={profile} onEdit={() => setEditing(true)} />;
}
