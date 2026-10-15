import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket';
import {
  addComment,
  addParticipant,
  applyOptionUpsert,
  applyVoteUpdate,
  removeAvailability,
  removeOption,
  upsertAvailability,
  upsertParticipantLocation,
  removeParticipantLocation,
  setBoard,
} from '../store/boardSlice';
import { clearSession } from '../store/sessionSlice';

const useBoardSocket = (boardId) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionId = useSelector((state) => state.session?.id);

  useEffect(() => {
    // Depends on `useSocket()` having already created the instance — in
    // BoardPage the two are called adjacently and React runs effects in
    // declaration order, so this never bails. Keep the calls adjacent, or move
    // the creation here, or the board connects but stops receiving events.
    const socket = getSocket();
    if (!socket) return undefined;

    const handleVoteUpdated = (payload) => {
      dispatch(applyVoteUpdate(payload));
    };

    // Roots and replies share one event — `parentId` on the comment (and the
    // root's `replyCount` beside it) says where it lands, and the reducer routes
    // it, so a reply needs no second subscription.
    const handleCommentAdded = (payload) => {
      dispatch(
        addComment({
          optionId: payload.optionId,
          comment: payload.comment,
          commentCount: payload.commentCount,
          replyCount: payload.replyCount,
        }),
      );
    };

    // Options are proposed, edited, and removed by anyone on the board, so
    // every client needs the list to track those without a refresh. Create and
    // update share the upsert; the reducer dedupes the poster's own echo.
    const handleOptionCreated = (payload) => {
      dispatch(applyOptionUpsert(payload));
    };

    const handleOptionUpdated = (payload) => {
      dispatch(applyOptionUpsert(payload));
    };

    // Removal cascades to the thread and the map pin inside the reducer — the
    // server deletes the option's votes, comments, and location with it.
    const handleOptionDeleted = (payload) => {
      dispatch(removeOption(payload.optionId));
    };

    const handleAvailabilityUpdated = (payload) => {
      dispatch(upsertAvailability(payload));
    };

    const handleAvailabilityRemoved = (payload) => {
      dispatch(removeAvailability(payload));
    };

    const handleLocationUpdated = (payload) => {
      dispatch(upsertParticipantLocation(payload));
    };

    const handleLocationRemoved = (payload) => {
      dispatch(removeParticipantLocation(payload.participantId));
    };

    const handleBoardDecided = (payload) => {
      dispatch(setBoard({ decidedOptionId: payload.decidedOptionId, status: 'decided' }));
    };

    // Owner-only settings gate proposing, so a member's composer has to react
    // the moment the owner flips the toggle — without a reload. The payload is
    // a partial and `setBoard` merges, so a name change can't wipe fields the
    // broadcast didn't mention.
    const handleBoardUpdated = (payload) => {
      dispatch(setBoard(payload));
    };

    // Nobody in the room asked for a join, so everyone already looking at the
    // roster has to be told — the People list, the tab's count badge, and the
    // Dates tab's name tags all read this one array, so one dispatch moves all
    // three. The person who just joined hydrates from their own REST fetch.
    const handleParticipantAdded = (payload) => {
      dispatch(addParticipant(payload));
    };

    const handleParticipantRemoved = (payload) => {
      if (sessionId && payload.participantId === sessionId) {
        dispatch(clearSession());
        navigate('/');
      }
    };

    socket.on('vote:updated', handleVoteUpdated);
    socket.on('comment:added', handleCommentAdded);
    socket.on('option:created', handleOptionCreated);
    socket.on('option:updated', handleOptionUpdated);
    socket.on('option:deleted', handleOptionDeleted);
    socket.on('availability:updated', handleAvailabilityUpdated);
    socket.on('availability:removed', handleAvailabilityRemoved);
    socket.on('location:updated', handleLocationUpdated);
    socket.on('location:removed', handleLocationRemoved);
    socket.on('board:decided', handleBoardDecided);
    socket.on('board:updated', handleBoardUpdated);
    socket.on('participant:added', handleParticipantAdded);
    socket.on('participant:removed', handleParticipantRemoved);

    return () => {
      socket.off('vote:updated', handleVoteUpdated);
      socket.off('comment:added', handleCommentAdded);
      socket.off('option:created', handleOptionCreated);
      socket.off('option:updated', handleOptionUpdated);
      socket.off('option:deleted', handleOptionDeleted);
      socket.off('availability:updated', handleAvailabilityUpdated);
      socket.off('availability:removed', handleAvailabilityRemoved);
      socket.off('location:updated', handleLocationUpdated);
      socket.off('location:removed', handleLocationRemoved);
      socket.off('board:decided', handleBoardDecided);
      socket.off('board:updated', handleBoardUpdated);
      socket.off('participant:added', handleParticipantAdded);
      socket.off('participant:removed', handleParticipantRemoved);
    };
  }, [boardId, dispatch, navigate, sessionId]);
};

export default useBoardSocket;