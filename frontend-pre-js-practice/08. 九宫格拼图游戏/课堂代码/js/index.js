// 首先封装两个查找方法
// document.querySelector 以及 document.querySelectorAll
// 都是 html5 新增的方法
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

// 做一些初始化工作
var game = $(".game"); // 获取 game 的 DOM 节点
var isOver = true; // 游戏是否结束，一开始处于结束状态
// 每个 div 小方块正确的 postion 位置
var rightPosition = [
  { x: 0, y: 0, left: 0, top: 0 },
  { x: -200, y: 0, left: 200, top: 0 },
  { x: -400, y: 0, left: 400, top: 0 },
  { x: 0, y: -200, left: 0, top: 200 },
  { x: -200, y: -200, left: 200, top: 200 },
  { x: -400, y: -200, left: 400, top: 200 },
  { x: 0, y: -400, left: 0, top: 400 },
  { x: -200, y: -400, left: 200, top: 400 },
  { x: -400, y: -400, left: 400, top: 400 },
];
var width = null; // 存储游戏区域每一个盒子的宽度
var currentPosition = []; // 存储当前游戏进行中的时候，每一个小方块的位置

/**
 * 将数组里面的元素打乱
 * @param {*} arr 接收一个数组
 */
function shuffle(arr) {
  for (var i = arr.length - 1; i >= 0; i--) {
    // 获取一个随机的下标
    var randomIndex = Math.floor(Math.random() * (i + 1));
    // 进行交换
    var temp = arr[randomIndex];
    arr[randomIndex] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

/**
 * 设置每一个盒子打乱后渲染位置
 */
function setItemPosition() {
  // 首先，先对原本的位置进行一份拷贝
  currentPosition = JSON.parse(JSON.stringify(rightPosition));
  // 接下来针对currentPosition进行一个顺序的打乱
  currentPosition = shuffle(currentPosition);
  // 接下来获取到游戏区域下面所有的 div（小方块）
  var divs = $$(".game>div");
  // 然后将每一个 div 按照新的打乱了顺序的 currentPosition 来进行渲染
  for (var i = 0; i < divs.length; i++) {
    divs[i].style.left = currentPosition[i].left + "px";
    divs[i].style.top = currentPosition[i].top + "px";
  }
  // 完事后将 isOver 设置为 false，游戏正式开始
  isOver = false;
}

/**
 * 初始化游戏
 */
function init() {
  game.innerHTML = ""; // 一开始先清空游戏区域

  // 1. 接下来我们需要往 game 里面生成小方块
  // 注意，这里小方块只会生成 8 个，最后一个不生成，因为最后一个是空白
  for (var i = 0; i < 8; i++) {
    game.innerHTML += `
        <div class="item" style="background-position:${rightPosition[i].x}px ${
      rightPosition[i].y
    }px;left:${rightPosition[i].left}px;top:${rightPosition[i].top}px" >
            <div class="cardNo" style="opacity: 0;">${i + 1}</div>
        </div>
    `;
  }
  width = $(".item").offsetWidth; // 更新 width 的存储，存储的是 item 小方块的宽度

  // 2. 过1秒钟之后，需要打乱每个盒子的位置
  setTimeout(setItemPosition, 1000);
}

/**
 * 绑定事件
 */
function bindEvent() {
  // 思考：有哪些事件

  // 1. 方块点击事件
  game.onclick = function (e) {
    if (e.target.className === "cardNo" && !isOver) {
      // 如果点击的是小方块，并且游戏是处于开始状态

      var node = e.target.parentNode; // 先获取到父节点，也就是 div.item
      // 接下来需要根据父节点的 left 以及 top 值，推断出父节点4个方向的left和top值
      var left = parseInt(node.style.left); // 用户点击的那个 div.item 的left值
      var top = parseInt(node.style.top); // 用户点击的那个 div.item 的top值
      // 推断4个方向
      var direction = [
        { left, top: top - width }, // 上
        { left: left + width, top }, // 右
        { left, top: top + width }, // 下
        { left: left - width, top }, // 左
      ];

      // currentPosition数组的最后一个对象的 left 和 top 值就是空白方块所在的位置
      // 这里通过过滤就看4个方向中有没有一个和最后一个空白方块的left、top值吻合
      // 如果有，说明就可以朝对应的方向移动
      direction = direction.filter(function (item) {
        return (
          item.left === currentPosition[currentPosition.length - 1].left &&
          item.top === currentPosition[currentPosition.length - 1].top
        );
      });

      if (direction.length) {
        // 如果进入此分支，说明存在和空白方块吻合的方向，也就说明能够移动

        // 这里先找到用户点击的这个方块在 currentPosition 里面是第几个
        var index = null;
        for (var i = 0; i < currentPosition.length; i++) {
          if (
            currentPosition[i].left === left &&
            currentPosition[i].top === top
          ) {
            index = i;
            break;
          }
        }

        // 接下来就需要对方块的顺序进行一个更新
        currentPosition[index].left = direction[0].left;
        currentPosition[index].top = direction[0].top;

        // 还需要更新 currentPosition 中最后一个空白对象的 left 和 top 值
        currentPosition[currentPosition.length - 1].left = parseInt(
          node.style.left
        );
        currentPosition[currentPosition.length - 1].top = parseInt(
          node.style.top
        );

        // 注意，上面所做的，只是更新 currentPosition，而 currentPosition 是背后用到位置数组
        // 当前在页面上看不到任何效果，因此我们还需要更新 node 的 left 和 top 值，从而能够看到效果
        node.style.left = direction[0].left + "px";
        node.style.top = direction[0].top + "px";

        // 每次移动一次，都需要判断游戏是否结束
        isOver = true; // 假设游戏已经结束
        for (var i = 0; i < currentPosition.length; i++) {
          // 这里面其实就是比较 currentPosition 和 rightPosition，他俩里面的每一个对象的 left 值和 top 值都相等的话，说明在正确位置
          if (
            currentPosition[i].left === rightPosition[i].left &&
            currentPosition[i].top === rightPosition[i].top
          ) {
            continue; // 比较下一个
          } else {
            isOver = false; // 说明游戏没有结束
            break;
          }
        }
        // 跳出 for 循环之后，就需要根据 isOver 的状态来判断游戏是否结束
        if (isOver) {
          node.ontransitionend = function () {
            window.alert("游戏结束");
            node.ontransitionend = null;
          };
        }
      }
    }
  };

  // 2. 暂停事件

  // 3. 重来

  // 4. 切换图片和编号
}

/**
 * 整个应用的主函数，算是程序的入口
 */
function main() {
  // 1.初始化游戏
  init();

  // 2. 绑定事件
  bindEvent();
}
main();
