import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import useBoardSocket from '../hooks/useBoardSocket';
import { initSocket } from '../services/socket';
import { fetchBoard, getMe } from '../services/board';
import { fetchOptions } from '../services/options';
import { fetchAvailability } from '../services/availability';
import { fetchParticipants } from '../services/participants';
import { fetchLocations } from '../services/location';
import {
  setBoard,
  setOptions,
  setAvailability,
  setParticipants,
  setLocations,
  setStatus,
  resetBoard,
} from '../store/boardSlice';
import { setSession } from '../store/sessionSlice';
import BoardHeader from '../features/board/BoardHeader';
import BoardTabs from '../features/board/BoardTabs';
import OptionsList from '../features/options/OptionsList';
import ProposeOptionForm from '../features/options/ProposeOptionForm';
import AvailabilityGrid from '../features/availability/AvailabilityGrid';
import BoardMapSection from '../features/map/BoardMapSection';
import ParticipantList from '../features/board/ParticipantList';

const TAB_LABELS = { options: 'Options', dates: 'Dates', map: 'Map', people: 'People' };

const BoardPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.board.status);
  const [activeTab, setActiveTab] = useState('options');
  const [optionPrefill, setOptionPrefill] = useState(null);
  const prefillNonce = useRef(0);
  const [mapFocus, setMapFocus] = useState(null);
  const focusNonce = useRef(0);

  // Cross-tab handoff: the map tab proposes a place, the options tab receives
  // it. BoardPage owns the handoff state so neither feature imports the other.
  // Fields stay flat (with a fresh `nonce`) so ProposeOptionForm can tell one
  // handoff from the next by identity alone.
  const handleProposePlace = (place) => {
    prefillNonce.current += 1;
    setOptionPrefill({ ...place, nonce: prefillNonce.current });
    setActiveTab('options');
  };

  // And the same in reverse: the People tab sends a participant to the map.
  // The nonce lets the map re-focus on someone it is already focused on.
  const handleViewPersonOnMap = (participantId) => {
    focusNonce.current += 1;
    setMapFocus({ participantId, nonce: focusNonce.current });
    setActiveTab('map');
  };

  useSocket();
  useBoardSocket(boardId);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) {
        dispatch(resetBoard());
        dispatch(setStatus('loading'));
      }

      try {
        const [board, options, me, availabilityRes, participantsRes, locationsRes] = await Promise.all([
          fetchBoard(boardId),
          fetchOptions(boardId),
          getMe(),
          fetchAvailability(boardId),
          fetchParticipants(boardId),
          fetchLocations(boardId),
        ]);

        if (!cancelled) {
          if (me.participant && me.board) {
            dispatch(setSession({
              id: me.participant.id,
              boardId: me.board.id,
              role: me.participant.role,
              displayName: me.participant.displayName,
            }));
          }
          dispatch(setBoard(board));
          dispatch(setOptions(options.options));
          dispatch(setAvailability(availabilityRes.slots));
          dispatch(setParticipants(participantsRes.participants));
          dispatch(setLocations(locationsRes));
          dispatch(setStatus('succeeded'));
          initSocket().connect();
        }
      } catch {
        if (!cancelled) {
          dispatch(resetBoard());
          dispatch(setStatus('failed'));
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [boardId, dispatch]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-4 font-sans text-sm text-text-muted">Loading board...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/15 font-heading text-xl font-bold text-error">
          !
        </div>
        <h1 className="mt-5 font-heading text-2xl font-bold text-text-primary">
          Couldn&apos;t load this board
        </h1>
        <p className="mt-3 font-sans text-text-muted">
          It may have been removed, or your session no longer has access.
        </p>
        <Link
          to="/"
          className="mt-8 rounded-btn bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
            Settled
          </Link>
        </div>
      </nav>

      {/* Nav → board bar → tab bar read as one unit: no vertical gap between
          them, only the tab panel below breathes. */}
      <main className="pb-12">
        <div className="mx-auto max-w-5xl px-4">
          <BoardHeader boardId={boardId} />
        </div>

        <BoardTabs active={activeTab} onChange={setActiveTab} />

        <div className="mx-auto max-w-5xl px-4">
          <div role="tabpanel" aria-label={TAB_LABELS[activeTab]} className="mt-5">
            {activeTab === 'options' && (
              <>
                <OptionsList onViewOnMap={() => setActiveTab('map')} />
                <ProposeOptionForm prefill={optionPrefill} />
              </>
            )}

            {activeTab === 'dates' && <AvailabilityGrid boardId={boardId} />}

            {activeTab === 'map' && (
              <BoardMapSection
                boardId={boardId}
                onProposePlace={handleProposePlace}
                focusParticipant={mapFocus}
              />
            )}

            {activeTab === 'people' && (
              <ParticipantList boardId={boardId} onViewOnMap={handleViewPersonOnMap} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoardPage;
