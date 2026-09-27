import type { TeamAvatarDefinition } from './TeamAvatar';

export interface TeamDialogueRequest {
  avatar: TeamAvatarDefinition;
  playerMessage: string;
}

export interface TeamDialogueResponse {
  avatarId: string;
  text: string;
  source: 'local';
}

/** Safe local dialogue layer; a future server-authorized AI provider can implement the same contract. */
export function answerTeamDialogue(request: TeamDialogueRequest): TeamDialogueResponse {
  const message = request.playerMessage.trim();
  const lower = message.toLowerCase();
  const { avatar } = request;

  if (!message) return { avatarId: avatar.id, text: avatar.greeting, source: 'local' };

  if (avatar.id === 'elder' && /(should|build|make|add|create)/.test(lower)) {
    return { avatarId: avatar.id, text: 'Elder: First, determine whether it needs to exist. Then determine what must be true for it to work. Go.', source: 'local' };
  }

  const topic = avatar.topics.find(item => lower.includes(item.toLowerCase()));
  if (topic) {
    return { avatarId: avatar.id, text: avatar.displayName + ': That is within my focus: ' + topic + '. ' + avatar.interaction, source: 'local' };
  }

  return { avatarId: avatar.id, text: avatar.displayName + ': ' + avatar.interaction, source: 'local' };
}
