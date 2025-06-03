window.utils = {
  createBoardUrl: function (board) {
    const params = new URLSearchParams({
      boardId: board.boardId,
      title: encodeURIComponent(board.title),
      description: encodeURIComponent(board.description),
      category: encodeURIComponent(board.category),
      methodology: encodeURIComponent(board.methodology),
      progress: encodeURIComponent(board.progress),
      lastEdited: encodeURIComponent(board.lastEdited),
    });
    return `board.html?${params.toString()}`;
  },
};
