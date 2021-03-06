import ItemSet from './ItemSet.js';
import StopFlag from './StopFlag.js';
import Timer from './timer.js';

export default class CarouselSlider {
  constructor({
    $slider,
    elementWidth,
    createItemElFunc,
    $prevBtn,
    $nextBtn,
    $slideCurNum,
    $slideLastNum,
    intervalTime,
  }) {
    this.$slider = $slider;
    this.elementWidth = elementWidth;
    this.createItemEl = createItemElFunc;
    this.$prevBtn = $prevBtn;
    this.$nextBtn = $nextBtn;
    this.$slideCurNum = $slideCurNum;
    this.$slideLastNum = $slideLastNum;
    this.timer = new Timer({ $prevBtn, $nextBtn, intervalTime });
    this.state = null;
    this.itemSet = null;
    this.stopFlag = new StopFlag();
    this.$prevBtn.addEventListener('click', this.onPrevBtn.bind(this));
    this.$nextBtn.addEventListener('click', this.onNextBtn.bind(this));
    this.$slider.addEventListener(
      'transitionend',
      this.transitionEnd.bind(this)
    );
  }
  setTimer() {
    this.timer.setTimer();
  }
  clearTimer() {
    this.timer.clearTimer();
  }
  setSlideNum() {
    const $curNum = this.$slideCurNum;
    const $lastNum = this.$slideLastNum;
    const curNum = this.itemSet.getCurIdx() + 1;
    const lastNum = this.itemSet.getLength();
    $curNum.textContent = curNum;
    $lastNum.textContent = lastNum;
  }
  onPrevBtn() {
    if (this.stopFlag.isTrue()) return;
    this.stopFlag.setTrue();
    this.clearTimer();
    this.setTimer();
    const { itemSet } = this;
    if (itemSet.getLength() === 1) return;
    this.moveToPrevPage();
    itemSet.decreaseIdx();
    this.setStateFirst();
    this.setSlideNum();
  }
  onNextBtn() {
    if (this.stopFlag.isTrue()) return;
    this.stopFlag.setTrue();
    this.clearTimer();
    this.setTimer();
    const { itemSet } = this;
    if (itemSet.getLength() === 1) return;
    this.moveToNextPage();
    itemSet.increaseIdx();
    this.setStateLast();
    this.setSlideNum();
  }
  transitionEnd() {
    const { $slider, itemSet } = this;
    this.offTransition();
    if (this.isFirstPage()) {
      const prevItem = itemSet.getPrevItem();
      const prevItemEl = this.createItemEl(prevItem);
      $slider.removeChild($slider.lastElementChild);
      $slider.insertBefore(prevItemEl, $slider.firstElementChild);
    }
    if (this.isLastPage()) {
      const nextItem = itemSet.getNextItem();
      const nextItemEl = this.createItemEl(nextItem);
      $slider.removeChild($slider.firstElementChild);
      $slider.appendChild(nextItemEl);
    }
    this.setPageMid();
    setTimeout(() => {
      this.stopFlag.setFalse();
    }, 200);
  }
  initItemSet(itemSet) {
    this.itemSet = new ItemSet(itemSet);
  }
  clearItemSet() {
    this.itemSet = null;
  }
  initSlideList() {
    const { items, length } = this.itemSet;
    this.offTransition();
    this.setPageMid();
    this.setSlideNum();

    if (length === 1) {
      // slider??? item??? ????????? ????????? ??? ????????? ??????
      const firstItem = items[0];
      const minSlideLength = 3;
      new Array(minSlideLength)
        .fill()
        .reduce((arr) => [...arr, firstItem], [])
        .forEach((targetItem) => {
          this.$slider.appendChild(this.createItemEl(targetItem));
        });
      return;
    }

    const targetItems = [items[length - 1], items[0], items[1]];
    targetItems.forEach((targetItem) => {
      this.$slider.appendChild(this.createItemEl(targetItem));
    });
    this.stopFlag.setFalse(); // ?????? ??????????????? ??????????????? ???????????? ???????????? ????????? ?????? stopFlag ?????????
    return;
  }
  setStateFirst() {
    this.state = 'first';
  }
  setStateLast() {
    this.state = 'last';
  }
  setStateMid() {
    this.state = 'mid';
  }
  moveToPrevPage() {
    this.onTransition();
    this.$slider.style.transform = `translate3D(0, 0, 0)`;
  }
  moveToNextPage() {
    this.onTransition();
    this.$slider.style.transform = `translate3D(-${
      this.elementWidth * 2
    }px, 0, 0)`;
  }
  setPageFirst() {
    this.$slider.style.transform = `translate3D(0, 0, 0)`;
    this.setStateFirst();
  }
  setPageMid() {
    this.$slider.style.transform = `translate3D(-${this.elementWidth}px, 0, 0)`;
    this.setStateMid();
  }
  isFirstPage() {
    return this.state === 'first';
  }
  isLastPage() {
    return this.state === 'last';
  }
  onTransition() {
    this.$slider.style.transition = 'transform 300ms';
  }
  offTransition() {
    this.$slider.style.transition = 'none';
  }
}
