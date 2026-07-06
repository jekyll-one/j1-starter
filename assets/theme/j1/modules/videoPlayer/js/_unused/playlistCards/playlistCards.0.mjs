/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videoPlayer/js/playlistCards.mjs (0)
 # Drop-in Lit web component for J1 Module videoPlayer
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

// =============================================================================
// Design notes
// -----------------------------------------------------------------------------
// * Renders into LIGHT DOM (createRenderRoot returns `this`) so the existing
//   global rules in skipad.css (.playlist-card, .playlist-thumb-wrapper, etc.)
//   apply unchanged.
// * Sets `display: contents` on the host so the parent's
//   `.playlist.card-mode { display: grid; grid-template-columns: repeat(N,1fr) }`
//   continues to treat each .playlist-card as a direct grid item — the
//   component is layout-transparent.
// * Existing event delegation on #playlistHistory (initRateHandler,
//   initEditHandler, initDeleteHandler, initPlayHandler) still works because
//   clicks bubble up through the light DOM exactly as before.
// * Keyed by videoId via the `repeat` directive — sorting, filtering and
//   incremental updates (rate change, delete one entry) touch only the
//   affected card's DOM, not the whole grid.
// =============================================================================

// Lit browser-loads
//
import { LitElement, html, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { repeat }                    from 'https://cdn.jsdelivr.net/npm/lit@3/directives/repeat.js/+esm';
import { classMap }                  from 'https://cdn.jsdelivr.net/npm/lit@3/directives/class-map.js/+esm';

export class PlaylistCards extends LitElement {

  // ---- light DOM rendering --------------------------------------------------
  // Render directly into the host element so skipad.css selectors and the
  // existing click-delegation on #playlistHistory keep working. Shadow DOM
  // would isolate the cards and break both.
  createRenderRoot() {
    return this;
  }

  // ---- reactive properties --------------------------------------------------
  static properties = {
    // Pre-sorted, pre-filtered playlist data. Assigned from
    // renderCards() as `el.entries = [...data]`.
    // attribute: false because this is a complex value, not a string.
    entries: { attribute: false },
  };

  constructor() {
    super();
    /** @type {Array<Object>} */
    this.entries = [];
  }

  connectedCallback() {
    super.connectedCallback();
    // Layout-transparent so the parent CSS grid sees .playlist-card
    // as direct children rather than as descendants of this host.
    this.style.display = 'contents';
  }

  // ---- pure formatting helpers ----------------------------------------------
  // Mirror the playlistManager helpers so the component is self-contained.

  _formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  _getTimeAgo(date) {
    const diff   = Date.now() - date.getTime();
    const mins   = Math.floor(diff / 60000);
    const hours  = Math.floor(diff / 3600000);
    const days   = Math.floor(diff / 86400000);
    const weeks  = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days  < 7)  return `${days} day${days > 1 ? 's' : ''} ago`;
    if (weeks < 5)  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  _isValidUrl(str) {
    if (!str || typeof str !== 'string') return false;
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  // ---- per-card template ----------------------------------------------------
  // Mirrors the markup from the original renderCards() one-to-one so existing
  // CSS and event delegation match without any other code changes.
  _cardTemplate(v) {
    const duration    = this._formatDuration(v.duration);
    const hasAuthor   = v.author && v.author.trim().length > 0;
    const timeAgo     = this._getTimeAgo(new Date(v.watchDate));
    const rating      = Number(v.rating) || 0;
    const hasRating   = rating > 0;
    const hasInfoLink = this._isValidUrl(v.infoLink);

    const rateBtnClasses = {
      'playlist-btn': true,
      'rate':         true,
      'rated':        hasRating,
    };

    // Text interpolations like ${v.title} and ${v.author} are auto-escaped
    // by Lit — _escapeHtml is no longer needed.
    return html`
      <div class="playlist-card card-base" data-video-id=${v.videoId}>

        <div class="playlist-thumb-wrapper">
          <img class="playlist-thumb"
               src=${`//img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
               alt="playlist-thumb">
          <div class="playlist-play-overlay">
            <i class="fas fa-play"></i>
          </div>
          ${duration
            ? html`<div class="playlist-duration">${duration}</div>`
            : nothing}
          ${hasRating
            ? html`
                <div class="playlist-rating">
                  ${Array.from({ length: rating }, () =>
                    html`<i class="fas fa-star"></i>`)}
                </div>`
            : nothing}
        </div>

        <div class="playlist-info">
          <div class="playlist-title">
            ${v.title}
            ${hasInfoLink
              ? html`
                  <a class="playlist-info-link"
                     href=${v.infoLink}
                     target="_blank"
                     rel="noopener noreferrer"
                     title="More info">
                    <i class="fas fa-info-circle"></i>
                  </a>`
              : nothing}
          </div>

          ${hasAuthor
            ? html`<div class="playlist-author">${v.author}</div>`
            : nothing}

          <div class="playlist-time-info">${timeAgo}</div>

          <div class="playlist-card-actions">
            <!-- bs modal: opened programmatically by initRateHandler -->
            <button class=${classMap(rateBtnClasses)}
                    title=${`Set rating${hasRating ? ` (${rating}/5)` : ''}`}
                    aria-label="Set rating">
              <i class="fas fa-star"></i>
            </button>
            <button class="playlist-btn edit"
                    title="Edit item"
                    aria-label="Edit item">
              <i class="fas fa-edit"></i>
            </button>
            <button class="playlist-btn delete"
                    title="Delete from playlist"
                    aria-label="Delete from playlist">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ---- root template --------------------------------------------------------
  render() {
    // guard against entries being null/undefined (defensive — callers in
    // skipad.js always assign an array, but a future caller might not).
    const items = Array.isArray(this.entries) ? this.entries : [];

    // wrap the repeat() directive in an html`` template. Returning a bare
    // directive from render() works in Lit 3 but is not the documented
    // contract; the html`` wrapper makes the template result explicit and
    // future-proof across Lit versions. Keyed by videoId — efficient
    // incremental updates on sort/filter/edit.
    return html`${repeat(
      items,
      v => v.videoId,
      v => this._cardTemplate(v),
    )}`;
  }
}

customElements.define('playlist-cards', PlaylistCards);
