import BoardMap from './BoardMap';
import LocationOptIn from './LocationOptIn';

const BoardMapSection = ({ boardId }) => {
  return (
    <section aria-label="Board map">
      <BoardMap />
      <div className="mt-4">
        <LocationOptIn boardId={boardId} />
      </div>
    </section>
  );
};

export default BoardMapSection;
