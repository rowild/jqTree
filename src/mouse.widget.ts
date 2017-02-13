/*
This widget does the same a the mouse widget in jqueryui.
*/

import SimpleWidget from "./simple.widget";

// tslint:disable-next-line: no-string-literal
const $ = window["jQuery"];

export default class MouseWidget extends SimpleWidget {
    protected is_mouse_started: boolean;
    protected mouse_delay: number;
    protected mouse_down_info: Object | null;
    private _mouse_delay_timer;
    private _is_mouse_delay_met: boolean;

    public setMouseDelay(mouse_delay: number) {
        this.mouse_delay = mouse_delay;
    }

    protected _init() {
        this.$el.on("mousedown.mousewidget", $.proxy(this._mouseDown, this));
        this.$el.on("touchstart.mousewidget", $.proxy(this._touchStart, this));

        this.is_mouse_started = false;
        this.mouse_delay = 0;
        this._mouse_delay_timer = null;
        this._is_mouse_delay_met = true;
        this.mouse_down_info = null;
    }

    protected _deinit() {
        this.$el.off("mousedown.mousewidget");
        this.$el.off("touchstart.mousewidget");

        const $document = $(document);
        $document.off("mousemove.mousewidget");
        $document.off("mouseup.mousewidget");
    }

    protected _mouseDown(e) {
        // Is left mouse button?
        if (e.which !== 1) {
            return;
        }

        const result = this._handleMouseDown(
            e,
            this._getPositionInfo(e)
        );

        if (result) {
            e.preventDefault();
        }

        return result;
    }

    protected _mouseCapture(position_info) {
        return true;
    }

    protected _mouseStart(position_info): boolean {
        return false;
    }

    protected _mouseDrag(position_info) {
        //
    }

    protected _mouseStop(position_info) {
        //
    }

    private _handleMouseDown(e, position_info: Object) {
        // We may have missed mouseup (out of window)
        if (this.is_mouse_started) {
            this._handleMouseUp(position_info);
        }

        this.mouse_down_info = position_info;

        if (! this._mouseCapture(position_info)) {
            return;
        }

        this._handleStartMouse();

        return true;
    }

    private _handleStartMouse() {
        const $document = $(document);
        $document.on("mousemove.mousewidget", $.proxy(this._mouseMove, this));
        $document.on("touchmove.mousewidget", $.proxy(this._touchMove, this));
        $document.on("mouseup.mousewidget", $.proxy(this._mouseUp, this));
        $document.on("touchend.mousewidget", $.proxy(this._touchEnd, this));

        if (this.mouse_delay) {
            this._startMouseDelayTimer();
        }
    }

    private _startMouseDelayTimer() {
        if (this._mouse_delay_timer) {
            clearTimeout(this._mouse_delay_timer);
        }

        this._mouse_delay_timer = setTimeout(
            () => {
                this._is_mouse_delay_met = true;
            },
            this.mouse_delay
        );

        this._is_mouse_delay_met = false;
    }

    private _mouseMove(e) {
        return this._handleMouseMove(
            e,
            this._getPositionInfo(e)
        );
    }

    private _handleMouseMove(e, position_info: Object) {
        if (this.is_mouse_started) {
            this._mouseDrag(position_info);
            return e.preventDefault();
        }

        if (this.mouse_delay && ! this._is_mouse_delay_met) {
            return true;
        }

        this.is_mouse_started = this._mouseStart(this.mouse_down_info) !== false;

        if (this.is_mouse_started) {
            this._mouseDrag(position_info);
        } else {
            this._handleMouseUp(position_info);
        }

        return ! this.is_mouse_started;
    }

    private _getPositionInfo(e) {
        return {
            page_x: e.pageX,
            page_y: e.pageY,
            target: e.target,
            original_event: e
        };
    }

    private _mouseUp(e) {
        return this._handleMouseUp(
            this._getPositionInfo(e)
        );
    }

    private _handleMouseUp(position_info: Object) {
        const $document = $(document);
        $document.off("mousemove.mousewidget");
        $document.off("touchmove.mousewidget");
        $document.off("mouseup.mousewidget");
        $document.off("touchend.mousewidget");

        if (this.is_mouse_started) {
            this.is_mouse_started = false;
            this._mouseStop(position_info);
        }
    }

    private _touchStart(e) {
        if (e.originalEvent.touches.length > 1) {
            return;
        }

        const touch = e.originalEvent.changedTouches[0];

        return this._handleMouseDown(
            e,
            this._getPositionInfo(touch)
        );
    }

    private _touchMove(e) {
        if (e.originalEvent.touches.length > 1) {
            return;
        }

        const touch = e.originalEvent.changedTouches[0];

        return this._handleMouseMove(
            e,
            this._getPositionInfo(touch)
        );
    }

    private _touchEnd(e) {
        if (e.originalEvent.touches.length > 1) {
            return;
        }

        const touch = e.originalEvent.changedTouches[0];

        return this._handleMouseUp(
            this._getPositionInfo(touch)
        );
    }
}