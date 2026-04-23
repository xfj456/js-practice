// 封装 DOM 查找方法
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

// 获取 DOM 节点
var game = $(".game");
// 游戏结束状态，一开始是结束的，因为要 1 秒后才开始
var isOver = true;

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

// 当前小方块的 postion 位置，先声明为空数组
// 后期从 rightPosition 拷贝一份打乱顺序
var currentPosition = [];
var width = null; // 存储游戏区域里面每一个盒子的宽度
var stopTimer = null; // 计时器
var sec = 0; // 秒
var minite = 0; // 分

/**
 *
 * @param {要打乱顺序的数组} arr
 * @returns
 */
function shuffle(arr) {
  for (var i = arr.length - 1; i >= 0; i--) {
    // 获取一个随机下标
    var rIndex = Math.floor(Math.random() * (i + 1));
    // 进行交换
    var temp = arr[rIndex];
    arr[rIndex] = arr[i];
    arr[i] = temp;
  }

  // 测试代码
  // var temp = arr[arr.length - 1];
  // arr[arr.length - 1] = arr[arr.length - 2];
  // arr[arr.length - 2] = temp;

  return arr;
}

/**
 * 设置每一个盒子的渲染位置
 */
function setItemPosition() {
  // 拷贝一份正确位置，这里使用深拷贝
  currentPosition = JSON.parse(JSON.stringify(rightPosition));
  // 打乱顺序
  currentPosition = shuffle(currentPosition);
  // 获取游戏区域下的所有 div，注意只获取子元素
  var divs = $$(".game>div");
  // 将每一个 div 按照 currentPosition 的顺序来渲染
  for (var i = 0; i < divs.length; i++) {
    divs[i].style.left = currentPosition[i].left + "px";
    divs[i].style.top = currentPosition[i].top + "px";
  }
  // 设置完成后，isOver 修改为 false，游戏正式开始
  isOver = false;
}

/**
 * 初始化游戏
 */
function initGame() {
  // 一开始清空整个游戏区域
  game.innerHTML = "";
  // 1. 生成 item 小方块，并显示正确的图片排序
  // 注意小方块只生成 8 个，最后一个不生成，最后一个是空白
  // 每个盒子里面还嵌套了一个 div.cardNo，用于显示盒子的编号
  for (var i = 0; i < 8; i++) {
    game.innerHTML += `<div 
            class="item" 
            style="background-position:${rightPosition[i].x}px ${
      rightPosition[i].y
    }px;
            left:${rightPosition[i].left}px;
            top:${rightPosition[i].top}px" 
        >
        <div class="cardNo" style="opacity: 0;">${i + 1}</div>
        </div>`;
  }
  width = $(".item").offsetWidth; // 给宽度赋值
  // 2. 过了 1 秒钟后，需要重新设置每个盒子的位置
  setTimeout(setItemPosition, 1000);
}

/**
 * 计时器方法
 */
function timer() {
  // 每隔一秒 sec 自增，到 60 秒时分自增
  stopTimer = setInterval(function () {
    sec++;
    if (sec >= 60) {
      sec = 0;
      minite++;
    }
    $(".panel>p").innerHTML = `总用时 ${minite} 分 ${sec} 秒`;
  }, 1000);
}

/**
 * 绑定事件
 */
function bindEvent() {
  // 1. 方块点击事件
  game.onclick = function (e) {
    if (e.target.className === "cardNo" && !isOver) {
      // 进入此 if，说明用户点击的是游戏区域的小方块，并且游戏已经开始

      // 首先开始计时
      // 后面如果用户暂停了，stopTimer 就会被清空
      // 然后也会进入此 if，重新开启计时器
      if (!stopTimer) {
        timer(); // 绑定计时器
        // 第一个按钮的文字重新修改为“暂停”
        // 因为有可能用户暂停之后直接点击方块开始游戏
        // 这个时候第一个按钮的文字就要重新还原为“暂停”
        $(".panel>button:first-child").innerHTML = "暂停";
      }

      // 用户点击的是 cardNo 盒子并且游戏已经开始

      // 获取到父节点，也就是 div.item
      var node = e.target.parentNode;

      // 根据父节点的 left 和 top 值，获取该节点 4 个方向的 left 和 top 值
      // 4 个点依次是上右下左
      var left = parseInt(node.style.left); // 用户点击的 div.item 的 left
      var top = parseInt(node.style.top); // 用户点击的 div.item 的 top

      // 获取该节点对应的 4 个方向
      var direction = [
        { left, top: top - width },
        { left: left + width, top },
        { left, top: top + width },
        { left: left - width, top },
      ];

      // 找到要移动的方向
      // currentPosition 数组的最后一个对象的 left 值和 top 值就是空白方块所在的位置
      // 这里我们通过 filter 找出 4 个方向中有没有和最后一个空白方块的 left、top 值吻合的
      direction = direction.filter(function (item) {
        return (
          item.left === currentPosition[currentPosition.length - 1].left &&
          item.top === currentPosition[currentPosition.length - 1].top
        );
      });

      if (direction.length) {
        // 进入此 if，说明可以移动
        // 先找到这个方块在 currentPosition 中是第几个
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

        // 首先需要更新 currentPosition 对象的顺序，因为一会儿要用 currentPostion 和 rightPostion 两个进行比较

        // 更新 currentPosition 数组中对应的这个方块的 left 值和 top 值
        currentPosition[index].left = direction[0].left;
        currentPosition[index].top = direction[0].top;

        // 更新 currentPosition 中最后一个空白对象的 left 和 top 值
        currentPosition[currentPosition.length - 1].left = parseInt(
          node.style.left
        );
        currentPosition[currentPosition.length - 1].top = parseInt(
          node.style.top
        );

        // 上面只是做的 currentPosition 数组的更新，页面上并看不出任何效果
        // 更新点击的节点的 left 和 top 值，这个时候就能看到方块移动的效果了
        node.style.left = direction[0].left + "px";
        node.style.top = direction[0].top + "px";

        // 判断游戏是否结束
        // 首先我们假设游戏已经结束
        isOver = true;
        // 遍历 currentPosition 数组
        for (var i = 0; i < currentPosition.length; i++) {
          // 比较 currentPosition 里面的每一项和 rightPosition 数组里面的每一项的 left 和 top 值是否相等
          if (
            currentPosition[i].left === rightPosition[i].left &&
            currentPosition[i].top === rightPosition[i].top
          ) {
            // 如果相等，那么直接 continue 开始比较下一项
            continue;
          } else {
            // 进入 else，说明不同，那么 isOver 修改为 false，跳出 for 循环
            isOver = false;
            break;
          }
        }
        // 根据 isOver 的状态来判断游戏是否结束
        if (isOver) {
          // 进入此 if 说明游戏已经结束
          // 但是我们需要监听到小方块移动结束后再出现弹框
          node.ontransitionend = function () {
            window.alert("游戏结束！");
            node.ontransitionend = null; // 删除 transitionend 事件
            // 清除计时器
            if (stopTimer) {
              clearInterval(stopTimer);
              stopTimer = null;
            }
          };
        }
      }
    }
  };

  // 2. 暂停
  $(".panel>button:first-child").onclick = function (e) {
    if (e.target.innerHTML === "暂停") {
      // 进入此 if，说明用户要暂停
      // 做暂停相关操作
      if (stopTimer) {
        clearInterval(stopTimer);
        stopTimer = null;
        e.target.innerHTML = "继续";
      }
    } else {
      // 进入此分支，说明用户要继续游戏
      timer();
      e.target.innerHTML = "暂停";
    }
  };

  // 3. 重来
  $(".panel>button:nth-child(2)").onclick = function () {
    // 重新设置每个小方块的位置
    setItemPosition();
    // 做一些初始化的操作
    minite = sec = 0;
    if (stopTimer) {
      clearInterval(stopTimer);
      stopTimer = null;
    }
    $(".panel>button:first-child").innerHTML = "暂停";
    $(".panel>p").innerHTML = `总用时 0 分 0 秒`;
  };

  // 4. 切换图片与编号
  // 思路很简单，其实就是通过 JS 切换 div.cardNo 的 opacity 值
  $(".panel>button:nth-child(3)").onclick = function () {
    // 获取所有的卡片编号 div
    var cardNo = $$(".cardNo");
    // 获取当前的透明度值
    var currentOpacity = parseInt(cardNo[0].style.opacity);
    // 根据当前的透明度值得到新的透明度值
    if (currentOpacity) {
      currentOpacity = 0;
    } else {
      currentOpacity = 1;
    }
    // 修改所有 cardNo 盒子的透明度
    for (var i = 0; i < cardNo.length; i++) {
      cardNo[i].style.opacity = currentOpacity;
    }
  };
}

// 程序主函数
function main() {
  // 初始化游戏
  initGame();
  // 绑定事件
  bindEvent();
}

main();
