import React from 'react'
import PropTypes from 'prop-types'

import frequently from '../utils/frequently'
import { getData } from '../utils'
import NimbleEmoji from './emoji/nimble-emoji'
import NotFound from './not-found'

export default class HorizonCategory extends React.Component {
  constructor(props) {
    super(props)

    this.data = props.data
    this.setContainerRef = this.setContainerRef.bind(this)
    this.setLabelRef = this.setLabelRef.bind(this)
  }

  componentDidMount() {
    this.margin = 0
    this.minMargin = 0

    this.memoizeSize()
  }

  shouldComponentUpdate(nextProps, nextState) {
    var {
        name,
        perLine,
        native,
        hasStickyPosition,
        emojis,
        emojiProps,
      } = this.props,
      { skin, size, set } = emojiProps,
      {
        perLine: nextPerLine,
        native: nextNative,
        hasStickyPosition: nextHasStickyPosition,
        emojis: nextEmojis,
        emojiProps: nextEmojiProps,
      } = nextProps,
      { skin: nextSkin, size: nextSize, set: nextSet } = nextEmojiProps,
      shouldUpdate = false

    if (name == 'Recent' && perLine != nextPerLine) {
      shouldUpdate = true
    }

    if (name == 'Search') {
      shouldUpdate = !(emojis == nextEmojis)
    }

    if (
      skin != nextSkin ||
      size != nextSize ||
      native != nextNative ||
      set != nextSet ||
      hasStickyPosition != nextHasStickyPosition
    ) {
      shouldUpdate = true
    }

    return shouldUpdate
  }

  memoizeSize() {
    if (!this.container) {
      // probably this is a test environment, e.g. jest
      this.left = 0
      this.maxMargin = 0
      return
    }
    var parent = this.container.parentElement
    var { left, width } = this.container.getBoundingClientRect()
    var { left: parentLeft } = parent.getBoundingClientRect()
    var { width: labelWidth } = this.label.getBoundingClientRect()

    this.left = left - parentLeft + parent.scrollLeft
    this.maxMargin = width;
  }

  handleScroll(scrollLeft) {
    var margin = scrollLeft - this.left
    margin = margin < this.minMargin ? this.minMargin : margin
    margin = margin > this.maxMargin ? this.maxMargin : margin
    if (margin == this.margin) return

    if (!this.props.hasStickyPosition) {
      this.label.style.left = `${margin}px`
    }

    this.margin = margin
    return true
  }

  getEmojis() {
    var { name, emojis, recent, perLine } = this.props

    if (name == 'Recent') {
      let { custom } = this.props
      let frequentlyUsed = recent || frequently.get(perLine)

      if (frequentlyUsed.length) {
        emojis = frequentlyUsed
          .map((id) => {
            const emoji = custom.filter((e) => e.id === id)[0]
            if (emoji) {
              return emoji
            }

            return id
          })
          .filter((id) => !!getData(id, null, null, this.data))
      }

      if (emojis.length === 0 && frequentlyUsed.length > 0) {
        return null
      }
    }

    if (emojis) {
      emojis = emojis.slice(0)
    }

    return emojis
  }

  updateDisplay(display) {
    var emojis = this.getEmojis()

    if (!emojis) {
      return
    }

    this.container.style.display = display
  }

  setContainerRef(c) {
    this.container = c
  }

  setLabelRef(c) {
    this.label = c
  }

  render() {
    var {
        id,
        name,
        hasStickyPosition,
        emojiProps,
        i18n,
        notFound,
        notFoundEmoji,
      } = this.props,
      emojis = this.getEmojis(),
      labelStyles = {},
      labelSpanStyles = {},
      containerStyles = {}

    if (!emojis) {
      containerStyles = {
        display: 'none',
      }
    }

    if (!hasStickyPosition) {
      labelStyles = {
        height: 28,
      }

      labelSpanStyles = {
        position: 'absolute',
      }
    }

    return (
      <section
        ref={this.setContainerRef}
        className="emoji-mart-category"
        aria-label={i18n.categories[id]}
        style={containerStyles}
      >
        <div
          style={labelStyles}
          data-name={name}
          className="emoji-mart-category-label"
        >
          <span
            style={labelSpanStyles}
            ref={this.setLabelRef}
            aria-hidden={true /* already labeled by the section aria-label */}
          >
            {i18n.categories[id]}
          </span>
        </div>

        <ul className="emoji-mart-category-list" style={{width: `${emojis ? Math.ceil(emojis.length/4) * 36 : 0}px`}}>
          {emojis &&
            emojis.map((emoji) => (
              <li key={emoji.id || emoji}>
                {NimbleEmoji({ emoji: emoji, data: this.data, ...emojiProps })}
              </li>
            ))}
        </ul>

        {emojis &&
          !emojis.length && (
            <NotFound
              i18n={i18n}
              notFound={notFound}
              notFoundEmoji={notFoundEmoji}
              data={this.data}
              emojiProps={emojiProps}
            />
          )}
      </section>
    )
  }
}

HorizonCategory.propTypes /* remove-proptypes */ = {
  emojis: PropTypes.array,
  hasStickyPosition: PropTypes.bool,
  name: PropTypes.string.isRequired,
  native: PropTypes.bool.isRequired,
  perLine: PropTypes.number.isRequired,
  emojiProps: PropTypes.object.isRequired,
  recent: PropTypes.arrayOf(PropTypes.string),
  notFound: PropTypes.func,
  notFoundEmoji: PropTypes.string.isRequired,
}

HorizonCategory.defaultProps = {
  emojis: [],
  hasStickyPosition: true,
}
