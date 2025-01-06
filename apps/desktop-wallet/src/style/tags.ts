import { css } from 'styled-components'

export default css`
  .tagify__tag__removeBtn {
    display: none;
  }

  .tagify__input::before {
    line-height: 16px;
  }

  .tags-dropdown {
    position: fixed;
    bottom: var(--spacing-2) !important;
    left: var(--spacing-2) !important;
    right: var(--spacing-2) !important;
    width: auto !important;
    top: auto !important;
    margin: 0;

    .tagify__dropdown__wrapper {
      border: none;
      border-radius: var(--radius-small);
      background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.contrast : theme.bg.primary)};
    }

    .tagify__dropdown__item {
      color: ${({ theme }) => (theme.name === 'light' ? theme.font.contrastPrimary : theme.font.primary)};
      margin: 0;
      border-radius: 0;
      padding: var(--spacing-2);

      &:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.border};
      }
    }

    .tagify__dropdown__item--active {
      background-color: ${({ theme }) => theme.global.accent};
    }
  }
`
