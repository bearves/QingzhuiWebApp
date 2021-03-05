import React from 'react';
import { Layout, Menu} from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
  } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './index.css';

const { Sider } = Layout;
const { SubMenu } = Menu;
class PageMenu extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isSideBarCollapsed : true,
            pageSelected : this.props.page
        };
    }

    pageSelected (e) {
        this.setState({pageSelected : e.key});
        if (this.props.onPageSelected)
            this.props.onPageSelected(e.key);
    }

    render() {
        return (
            <Sider
                theme="light"
                collapsible
                collapsedWidth={0}
                collapsed={this.state.isSideBarCollapsed}
                onCollapse={(collapsed) => { this.setState({ isSideBarCollapsed: collapsed }) }}
            >

                <Menu
                    theme="light"
                    defaultSelectedKeys={[this.state.pageSelected]}
                    mode="inline"
                    forceSubMenuRender="true"
                    onSelect={(e) => { this.pageSelected(e) }}
                >
                    <Menu.Item id={"first-menu-item"} key="0" icon={<PieChartOutlined />}>
                        State Monitor
                    </Menu.Item>
                    <Menu.Item key="1" icon={<DesktopOutlined />}>
                        Gait Control
                    </Menu.Item>
                    <SubMenu key="sub1" icon={<UserOutlined />} title="Vision Control">
                        <Menu.Item key="2">Lidar map</Menu.Item>
                        <Menu.Item key="3">Camera</Menu.Item>
                        <Menu.Item key="4">Height</Menu.Item>
                    </SubMenu>
                </Menu>

            </Sider>
        );
    }
}

export {PageMenu};