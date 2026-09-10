import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket } from '../services/socket';
import { applyVoteUpdate } from '../store/boardSlice';

const useBoardSocket = (boardId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleVoteUpdated = (payload) => {
      dispatch(applyVoteUpdate(payload));
    };

    socket.on('vote:updated', handleVoteUpdated);

    return () => {
      socket.off('vote:updated', handleVoteUpdated);
    };
  }, [boardId, dispatch]);
};

export default useBoardSocket;