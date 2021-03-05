import React from 'react';
import './styles/style.css';
import { RuleTrendsComponent } from './ui-components/ruleTrendsComponent';

window.registerExtension('ruletrends/chart_page', function () {
  return <RuleTrendsComponent days={365} />;
});
