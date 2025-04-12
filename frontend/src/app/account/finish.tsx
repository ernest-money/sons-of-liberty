import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSol } from '@/hooks/useSol';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const FinishProfilePage = () => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const sol = useSol();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sol.createProfile({ name, about });
      toast.success('Profile created successfully');
      navigate({ to: '/' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Create your Nostr profile to start trading with other users
          </CardDescription>
        </CardHeader>
        <CardContent>
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
    </div>
  );
}; 