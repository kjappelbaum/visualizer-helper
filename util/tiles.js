'use strict';
import $ from 'jquery';

function noop() {}

const styles = `
<style>
.on-tabs-tiles {
    display: inline-flex;
    flex-wrap: wrap;
}
.on-tabs-tiles .cell {
    position: relative;
    border: 2px solid white;
}
.on-tabs-tiles .content {
    width: 120px;
    height: 120px;
    display: inline-flex;
    font-size:0.8em;
}
.on-tabs-tiles .hide {
    background-color: rgba(255,255,255,0.6);
    position: absolute;
    width: 120px;
    height: 120px;
    top:0;
    left:0;
    z-index:100;
}
.on-tabs-tiles .fa, .ci-icon {
    font-size: 5em;
    margin: auto;
}
.on-tabs-tiles .center {
    font-size: 4.5em;
    margin: auto;
    font-weight: bold;
}
.on-tabs-tiles .header {
    position:absolute;
    font-size: 1.4em;
    font-weight: bold;
    text-align: center;
    width: 100%;
    z-index: 100;
}
.on-tabs-tiles .bottomRight {
    position:absolute;
    bottom: 5px;
    right: 8px;
    font-weight: bold;
    font-size: 1.4em;
}
.on-tabs-tiles .reference {
    position:absolute;
    bottom: 1.5em;
    left: 0;
    text-align: center;
    width: 100%;
    font-size: 10px;
    overflow: hidden;
    white-space: pre;
    padding: 1px;
}

.on-tabs-tiles .ribbon-wrapper {
  width: 75px;
  height: 75px;
  overflow: hidden;
  position: absolute;
  top: 0px;
  right: 0px;
}
 
.on-tabs-tiles .ribbon {
  font: bold 1em Sans-Serif;
  color: white;
  text-align: center;
  transform:rotate(45deg);
  position: relative;
  padding: 3px 0px 0px 0px;
  left: 0px;
  top: 10px;
  width: 120px;
  background-color: rgba(255,0,0,0.9);
  z-index:10;
  
}
.on-tabs-tiles .ribbon.beta {
    background-color: rgba(0,0,255,0.9);
}
</style>
`

const defaultOptions = {
    tiles: [],
    onTileClick: noop,
    onTileShiftClick: noop,
    shouldRender: () => true,
    ribbon: () => '',
    isLink: () => true,
    isActive: () => true,
    backgroundColor: () => 'white',
    color: () => 'black'
};

module.exports = function(div, options) {
    let lineCount = 0;
    options = Object.assign({}, defaultOptions, options);
    const {tiles} = options;
    const $div = $('#' + div);
    $div.empty();
    $div.append(styles);
    const $main = $(`<div>`);
    $div.append($main);
    if (!tiles)  return $div.append('No tiles');
    $main.addClass('on-tabs-tiles');
    $main.append(tiles.map(getTile));

    $main.on('click', function (event) {
        let $el;
        if($(event.target).hasClass('cell')) {
            $el = $(event.target);
        } else {
            $el = $(event.target).parents('.cell').first();
        }
        let idx = $el.attr('data-idx');
        if(tiles[idx]) {
            options.onTileClick(event, tiles[idx], $el);
        }
    });


    function getTile(tile, idx) {
        tile.line = lineCount;
        if(Object.keys(tile).length === 1) {
            lineCount++;
            return '<div style="width: 100%"></div>';
        }
        if (!shouldRenderTile(tile)) return '';
        const ribbon = options.ribbon(tile);
        const active = options.isActive(tile);
        tile.iconType = /^(\w+)-/.exec(tile.icon);
        if (tile.iconType) tile.iconType = tile.iconType[1];
        const $el = $(`
                <div class="cell">
                    <div class='content'>
                        <div class='header'>${tile.header || ''}</div>
                        ${tile.icon ? `<div class="${tile.iconType} ${tile.icon}"><div class="bottomRight">${tile.title || ''}</div></div>` : `<div class="center">${tile.title || ''}</div>`}
                    </div>
                    <div class="reference">${tile.footer || ''}</div>
                    ${active ? '' : '<div class="hide"></div>'}
                    ${ribbon ? `<div class="ribbon-wrapper"><div class="ribbon beta">${ribbon}</div></div>` : ''}
                </div>
        `);

        $el.css({
            color: options.color(tile),
            backgroundColor: options.backgroundColor(tile),
            cursor: active && options.isLink(tile) ? 'pointer' : 'inherit',
        });

        $el.attr({
            'data-idx': idx
        });
        return $el;
    }

    function shouldRenderTile(tile) {
        return options.shouldRender(tile);
    }
};
