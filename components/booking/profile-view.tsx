import Image, { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";
import { FC } from "react";

interface Profile {
  name: string;
  profession: string;
  bio: string;
  avatarUrl: StaticImageData;
}
interface ProfileViewProps {
  profile: Profile | null;
  onNext: () => void;
}

export const ProfileView: FC<ProfileViewProps> = ({ profile, onNext }) => {
  if (!profile) return null;
  return (
    <>
      <div className="flex flex-col items-center text-center justify-between h-full w-full">
        <div className="flex items-center space-x-4">
          <Image
            src={profile.avatarUrl}
            alt={`Avatar de ${profile.name}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-md "
          />
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold text-foreground mt-4">
              {profile.name}
            </h1>
            <h2 className="text-md font-medium text-primary">
              {profile.profession}
            </h2>
          </div>
        </div>

        <p className="text-secondary-foreground max-w-lg mt-3 text-sm leading-relaxed">
          {profile.bio}
        </p>
        <div className="mt-6">
          <Button onClick={onNext} className="w-full ">
            Reservar Cita
          </Button>
        </div>
      </div>
    </>
  );
};
