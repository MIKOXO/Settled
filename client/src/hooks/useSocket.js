import { useEffect } from 'react';
import { getSocket, initSocket, disconnectSocket } from '../services/socket';

const useSocket = () => {
  useEffect(() => {
    initSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  return getSocket();
};

export default useSocket;
