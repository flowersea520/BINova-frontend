import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'Nova BI',
          title: 'Nova BI',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/ant-design/ant-design-pro',
          blankTarget: true,
        },
        {
          key: 'Nova BI',
          title: 'Nova BI',
          href: 'https://ant.design',
          blankTarget: true,
        },
      ]}
      copyright=" 2024 云厂出品"
    />
  );
};

export default Footer;
