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
      // The posting client applies the create response locally and then
      // receives its own `option:created` echo back — whichever lands second
      // must not produce a second copy of the same option.
      if (state.options.some((o) => o.id === action.payload.id)) return;
      state.options.unshift(action.payload);
    },
    // Create and update share one upsert: `option:created` and `option:updated`
    // carry the same full-option shape, and handling them differently would let
    // the two paths drift apart.
    applyOptionUpsert: (state, action) => {
      const incoming = action.payload;
      const idx = state.options.findIndex((o) => o.id === incoming.id);

      if (idx >= 0) {
        // `vote` is the one per-participant field, and the server always sends
        // it null — merging it would wipe the reaction this client holds.
        // Everything else in the payload is authoritative.
        const rest = { ...incoming };
        delete rest.vote;
        Object.assign(state.options[idx], rest);
      } else {
        state.options.unshift({ ...incoming, vote: incoming.vote ?? null });
      }

      // An option's place is also a map pin. Syncing it here keeps a remotely
      // created option from showing a location chip for a pin that isn't on
      // the map, and drops the pin when an edit clears the location.
      const pinIdx = state.optionLocations.findIndex((l) => l.optionId === incoming.id);

      if (incoming.location) {
        const pin = {
          optionId: incoming.id,
          lat: incoming.location.lat,
          lng: incoming.location.lng,
          placeName: incoming.location.placeName ?? null,
        };
        if (pinIdx >= 0) state.optionLocations[pinIdx] = pin;
        else state.optionLocations.push(pin);
      } else if (pinIdx >= 0) {
        state.optionLocations.splice(pinIdx, 1);
      }
    },
    updateOptionDetails: (state, action) => {
      const { optionId, changes } = action.payload;
      const option = state.options.find((o) => o.id === optionId);
      if (option) Object.assign(option, changes);
    },
    removeOption: (state, action) => {
      const optionId = action.payload;
      state.options = state.options.filter((o) => o.id !== optionId);
      // The server cascades the option's votes, comments, and location away with
      // it, so the store drops the matching thread state and map pin rather than
      // keeping entries nothing can ever resolve again.
      delete state.comments[optionId];
      state.optionLocations = state.optionLocations.filter(
        (l) => l.optionId !== optionId,
      );
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
        // Already-loaded reply lists survive a refresh of the root list: they
        // are fetched per comment on demand, and dropping them would collapse
        // a thread the user has open underneath them.
        replies: state.comments[optionId]?.replies ?? {},
      };
    },
    appendComments: (state, action) => {
      const { optionId, items, hasMore, nextCursor } = action.payload;
      const thread = state.comments[optionId] ?? {
        items: [],
        hasMore: false,
        status: 'idle',
        nextCursor: null,
        replies: {},
      };
      thread.items.push(...items);
      thread.hasMore = hasMore;
      thread.nextCursor = nextCursor ?? null;
      thread.status = 'succeeded';
      state.comments[optionId] = thread;
    },
    setReplies: (state, action) => {
      const { optionId, commentId, items, hasMore, status = 'succeeded', nextCursor } =
        action.payload;
      const thread = state.comments[optionId];
      if (!thread) return;

      // A reply can land over the socket while this page is still in flight.
      // Replacing the list outright would drop a message the user has already
      // seen, so the response is merged with whatever arrived meanwhile — the
      // id check also covers the poster reading back their own echo.
      const seen = new Set(items.map((reply) => reply.id));
      const late = (thread.replies[commentId]?.items ?? []).filter((reply) => !seen.has(reply.id));
      const merged = [...items, ...late].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      thread.replies[commentId] = {
        items: merged,
        hasMore,
        status,
        nextCursor: nextCursor ?? null,
      };
    },
    appendReplies: (state, action) => {
      const { optionId, commentId, items, hasMore, nextCursor } = action.payload;
      const thread = state.comments[optionId];
      const page = thread?.replies[commentId];
      if (!page) return;
      page.items.push(...items);
      page.hasMore = hasMore;
      page.nextCursor = nextCursor ?? null;
      page.status = 'succeeded';
    },
    /**
     * One entry point for every comment, root or reply — the POST response and
     * the `comment:added` broadcast carry the same shape, and `parentId` says
     * where the comment lands.
     *
     * `replyCount` is the ROOT's count after this comment (the server sends the
     * parent's number, since the posted comment's own is always 0), so it is
     * applied to the parent row rather than stored on the reply.
     */
    addComment: (state, action) => {
      const { optionId, comment, commentCount, replyCount } = action.payload;
      const thread = state.comments[optionId];

      if (comment.parentId) {
        const root = thread?.items.find((item) => item.id === comment.parentId);
        if (root && replyCount !== undefined) root.replyCount = replyCount;

        const page = thread?.replies[comment.parentId];
        // Replies read oldest-first, so a new one lands at the end — and the
        // poster receives their own broadcast back, hence the id check.
        if (page && !page.items.some((item) => item.id === comment.id)) {
          page.items.push(comment);
        }
      } else if (thread) {
        if (!thread.items.some((item) => item.id === comment.id)) {
          thread.items.unshift({ ...comment, replyCount: comment.replyCount ?? 0 });
        }
      } else {
        // A comment arriving for a thread nobody here has opened. It is held in
        // the option's count and picked up by the first fetch; creating an entry
        // would render a parent-less reply the UI can't place.
        state.comments[optionId] = {
          items: [],
          hasMore: false,
          status: 'idle',
          nextCursor: null,
          replies: {},
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
    addParticipant: (state, action) => {
      // The joiner isn't in the board room when the server broadcasts, so they
      // normally won't hear their own echo — they hydrate from the REST fetch
      // instead. A page load that races a join can still land one behind the
      // snapshot, so dedupe by id the way `addOption` and `addComment` do.
      if (state.participants.some((p) => p.id === action.payload.id)) return;
      state.participants.push(action.payload);
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
  applyOptionUpsert,
  updateOptionDetails,
  removeOption,
  applyVoteUpdate,
  setComments,
  appendComments,
  setReplies,
  appendReplies,
  addComment,
  setParticipants,
  addParticipant,
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
