import { createSlice } from '@reduxjs/toolkit';

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    board: null,
    options: [],
    comments: {},
    availability: [],
    participants: [],
    participantLocations: [],
    optionLocations: [],
    status: 'idle',
  },
  reducers: {
    setBoard: (state, action) => {
      if (state.board) {
        Object.assign(state.board, action.payload);
      } else {
        state.board = action.payload;
      }
    },
    setOptions: (state, action) => {
      state.options = action.payload;
    },
    addOption: (state, action) => {
      state.options.unshift(action.payload);
    },
    applyVoteUpdate: (state, action) => {
      const {
        optionId,
        likesCount,
        dislikesCount,
        score,
        leadingOptionIds,
        vote,
      } = action.payload;
      const option = state.options.find((o) => o.id === optionId);
      if (!option) return;

      if (likesCount !== undefined) option.likesCount = likesCount;
      if (dislikesCount !== undefined) option.dislikesCount = dislikesCount;
      if (score !== undefined) option.score = score;
      if (vote !== undefined) option.vote = vote;
      if (Array.isArray(leadingOptionIds)) {
        const leadingSet = new Set(leadingOptionIds);
        for (const opt of state.options) {
          opt.isLeading = leadingSet.has(opt.id);
        }
      }
    },
    setComments: (state, action) => {
      const {
        optionId,
        items,
        hasMore,
        status = 'succeeded',
        nextCursor,
      } = action.payload;
      state.comments[optionId] = {
        items,
        hasMore,
        status,
        nextCursor: nextCursor ?? null,
      };
    },
    appendComments: (state, action) => {
      const { optionId, items, hasMore, nextCursor } = action.payload;
      const thread = state.comments[optionId] ?? {
        items: [],
        hasMore: false,
        status: 'idle',
        nextCursor: null,
      };
      thread.items.push(...items);
      thread.hasMore = hasMore;
      thread.nextCursor = nextCursor ?? null;
      thread.status = 'succeeded';
      state.comments[optionId] = thread;
    },
    addComment: (state, action) => {
      const { optionId, comment, commentCount } = action.payload;
      const thread = state.comments[optionId];

      if (thread) {
        const exists = thread.items.some((item) => item.id === comment.id);
        if (!exists) thread.items.unshift(comment);
      } else {
        state.comments[optionId] = {
          items: [comment],
          hasMore: false,
          status: 'idle',
          nextCursor: null,
        };
      }

      const option = state.options.find((o) => o.id === optionId);
      if (option) {
        option.commentCount =
          commentCount !== undefined ? commentCount : option.commentCount + 1;
      }
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    setAvailability: (state, action) => {
      state.availability = action.payload;
    },
    upsertAvailability: (state, action) => {
      const { participantId, date, status } = action.payload;
      const dateKey = new Date(date).toISOString().slice(0, 10);
      const idx = state.availability.findIndex(
        (s) =>
          s.participantId === participantId &&
          new Date(s.date).toISOString().slice(0, 10) === dateKey,
      );
      if (idx >= 0) {
        state.availability[idx].status = status;
      } else {
        state.availability.push({ participantId, date, status });
      }
    },
    removeAvailability: (state, action) => {
      const { participantId, date } = action.payload;
      const dateKey = new Date(date).toISOString().slice(0, 10);
      state.availability = state.availability.filter(
        (s) =>
          !(
            s.participantId === participantId &&
            new Date(s.date).toISOString().slice(0, 10) === dateKey
          ),
      );
    },
    setLocations: (state, action) => {
      const { participantLocations, optionLocations } = action.payload;
      state.participantLocations = participantLocations ?? [];
      state.optionLocations = optionLocations ?? [];
    },
    upsertParticipantLocation: (state, action) => {
      const loc = action.payload;
      const idx = state.participantLocations.findIndex(
        (l) => l.participantId === loc.participantId,
      );
      if (idx >= 0) {
        state.participantLocations[idx] = loc;
      } else {
        state.participantLocations.push(loc);
      }
    },
    removeParticipantLocation: (state, action) => {
      const participantId = action.payload;
      state.participantLocations = state.participantLocations.filter(
        (l) => l.participantId !== participantId,
      );
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    resetBoard: () => ({
      board: null,
      options: [],
      comments: {},
      availability: [],
      participants: [],
      participantLocations: [],
      optionLocations: [],
      status: 'idle',
    }),
  },
});

export const {
  setBoard,
  setOptions,
  addOption,
  applyVoteUpdate,
  setComments,
  appendComments,
  addComment,
  setParticipants,
  setAvailability,
  upsertAvailability,
  removeAvailability,
  setLocations,
  upsertParticipantLocation,
  removeParticipantLocation,
  setStatus,
  resetBoard,
} = boardSlice.actions;
export default boardSlice.reducer;
