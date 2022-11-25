function StartingScreen({
  setStartButton,
  setWin,
  win,
  updateReady,
  ready,
}: {
  setStartButton: (value: boolean) => void;
  setWin: (value: number) => void;
  win: number;
  updateReady: (ready: boolean) => void;
  ready: boolean;
}) {
  return (
    <div className="starting-screen d-flex flex-column justify-content-center align-items-center">
      {win ? <p className="win-message mb-30">Player {win} wins!</p> : ""}
      <button
        onClick={() => {
          setStartButton(true);
          setWin(0);
        }}
        className="btn"
      >
        START
      </button>
    </div>
  );
}

export default StartingScreen;
