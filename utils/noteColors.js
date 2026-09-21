export const NOTE_COLORS = ['#4C6FFF', '#2FB380', '#E8A93A', '#E5484D', '#8B5CF6'];
export const DEFAULT_NOTE_COLOR = NOTE_COLORS[0];

export function getNoteColor(note) {
  return NOTE_COLORS.includes(note?.color) ? note.color : DEFAULT_NOTE_COLOR;
}

export function setNoteColor(note, color) {
  return {
    ...note,
    color: NOTE_COLORS.includes(color) ? color : DEFAULT_NOTE_COLOR,
  };
}