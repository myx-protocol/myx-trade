import { Button, styled } from '@mui/material'

export const TradeButton = styled(Button)` {}
  &.MuiButton-contained {
      color: var(--basic-white);
      height: 44px;
      padding: 0 20px;
      border-radius: 8px;
      box-shadow: inset 0 0 0 0.5px rgba(128, 255, 149, .5);
      background: var(--brand-deep-gradient);
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 13px */
      cursor: pointer;
      &[disabled] {
          opacity: 0.3;
          cursor: not-allowed;
      }
  }
`
