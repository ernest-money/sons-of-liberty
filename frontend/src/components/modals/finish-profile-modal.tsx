import React, { useState } from 'react';
import { useSol } from '@/hooks/useSol';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Modal } from './modal';
import { useAuth } from '@/hooks/useAuth';

interface FinishProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FinishProfileModal: React.FC<FinishProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const sol = useSol();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sol.createProfile({ name, about });

      // Refresh user data to update hasFinishedProfile
      await refreshUser();

      toast.success('Profile created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <Card className="border-0 shadow-none p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Create your Nostr profile to start trading with other users
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Input
                id="about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                required
                placeholder="Tell us about yourself"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Modal>
  );
}; 