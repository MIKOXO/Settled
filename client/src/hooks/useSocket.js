import { useEffect } from 'react';
import { getSocket, initSocket, disconnectSocket } from '../services/socket';

const useSocket = () => {
  useEffect(() => {
    const socket = initSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  return getSocket();
};

export default useSocket;
