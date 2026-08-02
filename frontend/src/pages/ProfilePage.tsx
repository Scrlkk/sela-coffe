import React from "react";
import { ProfileCard } from "@/components/profile/ProfileCard";

export const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ProfileCard />
    </div>
  );
};

export default ProfilePage;
