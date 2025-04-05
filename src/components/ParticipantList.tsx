
import { useState } from 'react';
import { Participant } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface ParticipantListProps {
  participants: Participant[];
  onChange: (participants: Participant[]) => void;
  showEmail?: boolean;
}

const ParticipantList = ({ participants, onChange, showEmail = true }: ParticipantListProps) => {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const addParticipant = () => {
    if (!newName.trim()) return;
    
    const newParticipant: Participant = {
      id: `p${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
    };
    
    onChange([...participants, newParticipant]);
    setNewName('');
    setNewEmail('');
  };

  const removeParticipant = (id: string) => {
    onChange(participants.filter(p => p.id !== id));
  };

  const updateParticipant = (id: string, field: keyof Participant, value: string) => {
    onChange(
      participants.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addParticipant();
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>Add people who will share this bill</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Participants list */}
        {participants.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No participants yet. Add someone to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={participant.name}
                    onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                    required
                  />
                  
                  {showEmail && (
                    <Input
                      placeholder="Email (optional)"
                      type="email"
                      value={participant.email}
                      onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                    />
                  )}
                </div>
                
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeParticipant(participant.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <Separator />
        
        {/* Add new participant form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
          <div className="space-y-2">
            <Label htmlFor="participantName">Name</Label>
            <Input
              id="participantName"
              placeholder="Participant name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          {showEmail && (
            <div className="space-y-2">
              <Label htmlFor="participantEmail">Email (Optional)</Label>
              <Input
                id="participantEmail"
                placeholder="Email address"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
        </div>
        
        <div>
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={addParticipant}
            disabled={!newName.trim()}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantList;
