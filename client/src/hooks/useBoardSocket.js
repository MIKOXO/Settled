import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket } from '../services/socket';
import { addComment, applyVoteUpdate, upsertAvailability } from '../store/boardSlice';

const useBoardSocket = (boardId) => {
  const dispatch = useDispatch();

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

    socket.on('vote:updated', handleVoteUpdated);
    socket.on('comment:added', handleCommentAdded);
    socket.on('availability:updated', handleAvailabilityUpdated);

    return () => {
      socket.off('vote:updated', handleVoteUpdated);
      socket.off('comment:added', handleCommentAdded);
      socket.off('availability:updated', handleAvailabilityUpdated);
    };
  }, [boardId, dispatch]);
};

export default useBoardSocket;