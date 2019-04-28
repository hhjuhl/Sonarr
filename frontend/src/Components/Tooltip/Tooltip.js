import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Manager, Popper, Reference } from 'react-popper';
import classNames from 'classnames';
import isMobileUtil from 'Utilities/isMobile';
import { kinds, tooltipPositions } from 'Helpers/Props';
import Portal from 'Components/Portal';
import styles from './Tooltip.css';

class Tooltip extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._scheduleUpdate = null;
    this._closeTimeout = null;

    this.state = {
      isOpen: false
    };
  }

  componentDidUpdate() {
    if (this._scheduleUpdate && this.state.isOpen) {
      this._scheduleUpdate();
    }
  }

  componentWillUnmount() {
    if (this._closeTimeout) {
      this._closeTimeout = clearTimeout(this._closeTimeout);
    }
  }

  //
  // Listeners

  onMeasure = ({ width }) => {
    this.setState({ width });
  }

  onClick = () => {
    if (isMobileUtil()) {
      this.setState({ isOpen: !this.state.isOpen });
    }
  }

  onMouseEnter = () => {
    if (this._closeTimeout) {
      this._closeTimeout = clearTimeout(this._closeTimeout);
    }

    this.setState({ isOpen: true });
  }

  onMouseLeave = () => {
    this._closeTimeout = setTimeout(() => {
      this.setState({ isOpen: false });
    }, 100);
  }

  //
  // Render

  render() {
    const {
      className,
      bodyClassName,
      anchor,
      tooltip,
      kind,
      position
    } = this.props;

    return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <span
              ref={ref}
              className={className}
              onClick={this.onClick}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
            >
              {anchor}
            </span>
          )}
        </Reference>

        <Portal>
          <Popper
            placement={position}
            eventsEnabled={false}
            modifiers={{
              preventOverflow: {
              // Fixes positioning for tooltips in the queue
              // and likely others.
                escapeWithReference: true
              }
            }}
          >
            {({ ref, style, scheduleUpdate }) => {
              this._scheduleUpdate = scheduleUpdate;

              return (
                <div
                  ref={ref}
                  className={styles.tooltipContainer}
                  style={style}
                  onMouseEnter={this.onMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  {
                    this.state.isOpen ?
                      <div
                        className={classNames(
                          styles.tooltip,
                          styles[kind]
                        )}
                      >
                        <div
                          className={classNames(
                            styles.arrow,
                            styles[kind],
                            styles[position]
                          )}
                        />

                        <div className={bodyClassName}>
                          {tooltip}
                        </div>
                      </div> :
                      null
                  }
                </div>
              );
            }}
          </Popper>
        </Portal>
      </Manager>
    );
  }
}

Tooltip.propTypes = {
  className: PropTypes.string,
  bodyClassName: PropTypes.string.isRequired,
  anchor: PropTypes.node.isRequired,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  kind: PropTypes.oneOf([kinds.DEFAULT, kinds.INVERSE]),
  position: PropTypes.oneOf(tooltipPositions.all)
};

Tooltip.defaultProps = {
  bodyClassName: styles.body,
  kind: kinds.DEFAULT,
  position: tooltipPositions.TOP
};

export default Tooltip;
