
// TODO: should go in a namespace

// takes 3 bits
PAWN   = 0;
KNIGHT = 1;
BISHOP = 2;
ROOK   = 3;
QUEEN  = 4;
KING   = 5;
RANK_IMAGE_NAME_TABLE = ["pawn", "knight", "bishop", "rook", "queen", "king"];

// takes 1 bit
WHITE = 0;
BLACK = 1;
COLOR_IMAGE_NAME_TABLE = ["white", "black"];

// ECRRR
// |||
// ||- Rank (PAWN, KNIGHT, etc)
// |- Color (WHITE, BLACK)
// - Exists (1 = has piece, 0 = no piece)
function makeFlags(color, rank)
{
    var flags = color << 3 | rank;
    //console.log("makeFlags (color=" +
    //    COLOR_IMAGE_NAME_TABLE[color] + ", rank=" +
    //    RANK_IMAGE_NAME_TABLE[rank] + "), flags=" + flags);
    return 1 << 4 | color << 3 | rank;
}
function getColorFromFlags(flags)
{
    return (flags >> 3) & 0x01;
}

var COLORED_RANK_TABLE = [];
for(var i = 0; i < 16; i++)
{
    COLORED_RANK_TABLE.push({});
}
for(var color = WHITE; color <= BLACK; color++)
{
    for(var rank = PAWN; rank <= KING; rank++)
    {
        var newImage = new Image();
        newImage.src = COLOR_IMAGE_NAME_TABLE[color] + '_' +
            RANK_IMAGE_NAME_TABLE[rank] + ".svg";
        COLORED_RANK_TABLE[color << 3 | rank].img = newImage;
    }
}
function getColoredRank(flags)
{
    return COLORED_RANK_TABLE[flags & 0x0F];
}

var RANK_TABLE = [
    {'moveDrawer': pawnMoveDrawer},
    {'moveDrawer': knightMoveDrawer},
    {'moveDrawer': bishopMoveDrawer},
    {'moveDrawer': rookMoveDrawer},
    {'moveDrawer': queenMoveDrawer},
    {'moveDrawer': kingMoveDrawer}];
function getRank(flags)
{
    return RANK_TABLE[flags & 0x07];
}




function setRoyalty(dst, offset, color)
{
    dst[offset + 0] = makeFlags(color, ROOK);
    dst[offset + 1] = makeFlags(color, KNIGHT);
    dst[offset + 2] = makeFlags(color, BISHOP);
    dst[offset + 3] = makeFlags(color, QUEEN);
    dst[offset + 4] = makeFlags(color, KING);
    dst[offset + 5] = makeFlags(color, BISHOP);
    dst[offset + 6] = makeFlags(color, KNIGHT);
    dst[offset + 7] = makeFlags(color, ROOK);
}

function ChessBoard(options)
{
    this.tiles = [];
    for(var i = 0; i < 64; i++)
    {
        this.tiles.push(0);
    }

    this.tileSize  = options.tileSize  ? options.tileSize  : 90;
    this.lightTile = options.lightTile ? options.lightTile : '#eee';
    this.darkTile  = options.darkTile  ? options.darkTile  : '#aaa';
    this.mouseOverTile = options.lightTile ? options.lightTile : '#88e';
    this.mouseOverRow = -1;
    this.mouseOverCol = -1;

    this.resetPieces = function resetPieces()
    {
        setRoyalty(this.tiles, 0, BLACK);
        for(var i = 8; i < 16; i++)
        {
            this.tiles[i] = makeFlags(BLACK, PAWN);
        }
        for(var i = 16; i < 48; i++)
        {
            this.tiles[i] = 0;
        }
        for(var i = 48; i < 56; i++)
        {
            this.tiles[i] = makeFlags(WHITE, PAWN);
        }
        setRoyalty(this.tiles, 56, WHITE);
    }
    this.resetPieces(); // reset the pieces initially
    this.drawTiles = function drawTiles(ctx)
    {
        for(var row = 0; row < 8; row++)
        {
            var nextColor = (row % 2) ? this.darkTile : this.lightTile;
            for(var col = 0; col < 8; col++)
            {
                if(row == this.mouseOverRow && col == this.mouseOverCol)
                {
                    ctx.fillStyle = this.mouseOverTile;
                }
                else
                {
                    ctx.fillStyle = nextColor;
                }
                ctx.fillRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
                nextColor = (nextColor == this.lightTile) ? this.darkTile : this.lightTile;
            }
        }
    }
    /*
    this.highlight = function highlight(ctx, row, col)
    {   
        ctx.fillStyle = '#55f';
        ctx.fillRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
    }
    */
    this.dump = function dump()
    {
        for(var row = 0; row < 8; row++)
        {
            for(var col = 0; col < 8; col++)
            {
                var flags = this.tiles[row * 8 + col];
                if(flags)
                {
                    console.log(row + ", " + col + " " +
                        COLOR_IMAGE_NAME_TABLE[(flags >> 3) & 1] +
                        RANK_IMAGE_NAME_TABLE[flags & 0x3]);
                }
            }
        }
    }
    this.drawMovesForAll = function drawMovesForAll(ctx)
    {
        for(var row = 0; row < 8; row++)
        {
            for(var col = 0; col < 8; col++)
            {
                var flags = this.tiles[row * 8 + col];
                if(flags)
                {
                    this.drawMovesFor(ctx, row, col, flags);
                }
            }
        }
    }
    this.drawMovesFor = function drawPiece(ctx, row, col, flags)
    {
        getRank(flags).moveDrawer(this, ctx, row, col, getColorFromFlags(flags));
    }
    this.drawPieces = function drawPieces(ctx)
    {
        for(var row = 0; row < 8; row++)
        {
            for(var col = 0; col < 8; col++)
            {
                var flags = this.tiles[row * 8 + col];
                if(flags)
                {
                    this.drawPiece(ctx, row, col, flags);
                }
            }
        }
    }
    this.drawPiece = function drawPiece(ctx, row, col, flags)
    {
        var tileX = col * this.tileSize;
        var tileY = row * this.tileSize;
        ctx.drawImage(getColoredRank(flags).img, tileX, tileY, this.tileSize, this.tileSize)
    }
}


function pawnMoveDrawer(board, ctx, row, col, color)
{
    /*
    var x = col * board.tileSize;
    var y = row * board.tileSize;
    ctx.fillStyle = '#f00';
    ctx.fillRect(x, y, 10, 10);
    */
}
function knightMoveDrawer(board, ctx, row, col, color)
{
}
function bishopMoveDrawer(board, ctx, row, col, color)
{
}
function rookMoveDrawer(board, ctx, row, col, color)
{
}
function queenMoveDrawer(board, ctx, row, col, color)
{
}
function kingMoveDrawer(board, ctx, row, col, color)
{
}