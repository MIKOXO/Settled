import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket';
import {
  addComment,
  applyVoteUpdate,
  upsertAvailability,
  upsertParticipantLocation,
  removeParticipantLocation,
  setBoard,
} from '../store/boardSlice';
import { clearSession } from '../store/sessionSlice';

const useBoardSocket = (boardId) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const session = useSelector((state) => state.session);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleVoteUpdated = (payload) => {
      dispatch(applyVoteUpdate(payload));
    };

    const handleCommentAdded = (payload) => {
      dispatch(
        addComment({
          optionId: payload.optionId,
          comment: payload.comment,
          commentCount: payload.commentCount,
        }),
      );
    };

    const handleAvailabilityUpdated = (payload) => {
      dispatch(upsertAvailability(payload));
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

    const handleParticipantRemoved = (payload) => {
      if (session && payload.participantId === session.id) {
        dispatch(clearSession());
        navigate('/');
      }
    };

    socket.on('vote:updated', handleVoteUpdated);
    socket.on('comment:added', handleCommentAdded);
    socket.on('availability:updated', handleAvailabilityUpdated);
    socket.on('location:updated', handleLocationUpdated);
    socket.on('location:removed', handleLocationRemoved);
    socket.on('board:decided', handleBoardDecided);
    socket.on('participant:removed', handleParticipantRemoved);

    return () => {
      socket.off('vote:updated', handleVoteUpdated);
      socket.off('comment:added', handleCommentAdded);
      socket.off('availability:updated', handleAvailabilityUpdated);
      socket.off('location:updated', handleLocationUpdated);
      socket.off('location:removed', handleLocationRemoved);
      socket.off('board:decided', handleBoardDecided);
      socket.off('participant:removed', handleParticipantRemoved);
    };
  }, [boardId, dispatch, navigate, session]);
};

export default useBoardSocket;