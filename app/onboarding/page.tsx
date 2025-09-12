// @/app/onboarding/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Importamos el componente Image de Next.js
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ALargeSmall, CircleUser, Smartphone } from "lucide-react";

interface Profession {
  id: number;
  name: string;
  category: string;
}

interface GroupedProfessions {
  [category: string]: Profession[];
}

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedProfession, setSelectedProfession] = useState<string>("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    "/default-avatar.webp"
  );

  const [groupedProfessions, setGroupedProfessions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);

      const { data: professionsData, error } = await supabase
        .from("professions")
        .select("id, name, category")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error al cargar profesiones:", error);
      } else if (professionsData) {
        // --- AJUSTE DE TIPO AQUÍ ---
        const grouped = professionsData.reduce(
          (acc: GroupedProfessions, prof) => {
            const category = prof.category || "Otras";
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(prof);
            return acc;
          },
          {}
        );

        setGroupedProfessions(grouped);
      }
      setLoading(false);
    };
    fetchData();
  }, [router, supabase]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firstName.trim() || !lastName.trim() || !selectedProfession)
      return;

    setIsSubmitting(true);
    let avatarPublicUrl = null;

    if (avatarFile) {
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);

      if (uploadError) {
        alert("Error al subir el avatar: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      avatarPublicUrl = data.publicUrl;
    }

    const profileData = {
      first_name: firstName,
      last_name: lastName,
      username: username,
      phone: phone,
      profession_id: parseInt(selectedProfession),
      onboarding_complete: true,
      ...(avatarPublicUrl && { avatar_url: avatarPublicUrl }),
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", user.id);

    if (updateError) {
      alert("Error al actualizar el perfil: " + updateError.message);
      setIsSubmitting(false);
    } else {
      router.push(`/dashboard/${user.id}`);
    }
  };

  if (loading) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ThemeSwitcher />
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <Typography variant="heading-lg">¡Bienvenido a Agendux!</Typography>
          <Typography variant="body-md" className="text-muted-foreground">
            Completemos tu perfil para empezar.
          </Typography>
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          {/* --- COMPONENTE DE CARGA DE AVATAR --- */}
          <div className="flex flex-col items-center space-y-2">
            <input
              id="avatar-upload"
              type="file"
              accept="image/png, image/jpeg, image/webp, image/jpg, image/gif, image/svg+xml, image/avif, image/apng, image/bmp, image/tiff, image/x-icon"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Image
                src={avatarPreview}
                alt="Cargar imagen de perfil"
                width={96}
                height={96}
                className="rounded-full object-cover border-2 border-dashed border-border hover:border-primary transition-colors text-center"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <div className="relative">
                <ALargeSmall className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <div className="relative">
                <ALargeSmall className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <div className="relative">
              <CircleUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: juanperez99"
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 1122334455"
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Profesión</Label>
            <Select onValueChange={setSelectedProfession} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu profesión..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedProfessions).map(
                  ([category, professionsList]) => (
                    <SelectGroup key={category}>
                      <SelectLabel>{category}</SelectLabel>
                      {(professionsList as Profession[]).map((prof) => (
                        <SelectItem key={prof.id} value={String(prof.id)}>
                          {prof.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar y Continuar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
