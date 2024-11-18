import { listMyChartByPageUsingPost } from '@/services/BiNova/chartController';
import { useModel } from '@umijs/max';
import { Avatar, Card, List, message, Result } from 'antd';
import Search from 'antd/es/input/Search';
import { SearchProps } from 'antd/lib/input';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

// 这个命名就是 页面的名称
/**
 *  添加图表页面
 * @constructor
 */
// 这里定义了一个名为 MyChartPage 的函数组件，渲染内容通过jsx
const MyChartPage: React.FC = () => {
  // 这里是： 可以定义状态或其他逻辑
  // 这里定义一个 默认参数的 变量
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'descend',
  };
  /**
   *  记住啊，周哥seachParams就是个对象，就是和后端的ChartQueryRequest请求dto一样，映射的
   */
  // 这里使用 ...进行属性赋值，防止变量污染
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  // 定义一个状态变量用来存储 后端响应的 图表列表数据
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { initialState, setInitialState } = useModel('@@initialState');
  // 获取全局的状态管理登录对象
  // 当使用 initialState 时，你应该直接调用它而不是写成 initialState()，因为 initialState 本身就是一个函数
  const { currentUser } = initialState ?? {};
  // 从后端获取 图表页面列表对象
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPost(searchParams);
      // 将响应的结果，存储到我们定义的state变量当中去
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏 ai生成的图表字符串中的 “title” 属性对象（因为在前端不好看，所以隐藏）
        // 当然也可以由后端处理，都可以
        res.data?.records.forEach((chart) => {
          if (chart.status === 'succeed') {
            // chart就是后端获取的每个 chart图表对象（JSON字符串），这里解析为 js对象
            const chartOption = JSON.parse(chart.genChart ?? '{}');
            // 变成js对象之后，设置其title属性为undefined，然后将新的对象转换为json字符串
            chartOption.title = undefined;
            chart.genChart = JSON.stringify(chartOption);
          }
        });
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e) {
      message.error('获取我的图表失败' + e.message);
    }
    setLoading(false);
  };
  // 可以理解为页面加载后执行的生命周期钩子，页面一加载就向后端发送请求，获取到图表列表页面数据
  useEffect(() => {
    loadData();
    // 将搜索参数searchParams发生改变，就会自动触发这个钩子，重新执行一遍
  }, [searchParams]);
  /**
   *  点击搜索 按钮触发的事件方法
   * @param value input输入框，输入的值，都在这个value这里
   * @param _e 事件对象（event object）
   * @param info info 参数可能是 Ant Design 的组件事件对象中的额外信息，用于提供关于事件的更多上下文
   */
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
    console.log(info?.source, value, _e);
    // 设置搜索条件
    setSearchParams({
      // 先拷贝原来的初始条件，然后我们修改
      ...initSearchParams,
      // 这个就是图表名称
      name: value,
    });
  };

  //  JSX 返回值，定义这个组件要渲染的内容
  return (
    // 前端表单里面的name；对应着 后端dto的属性字段，一定要一一对应
    <div className="my-chart">
      <div>
        {/*allowClear：这个属性使得搜索框右侧显示一个清除按钮，当用户点击它时会清除输入框中的内容。
        （该属性为布尔值，无需显式指定 true）*/}
        {/*onSearch当用户点击搜索按钮或按下 Enter 键时会触发 onSearch 事件处理函数*/}
        <Search
          placeholder="请输入图表的名称"
          loading={loading}
          allowClear
          enterButton="Search"
          size="large"
          onSearch={onSearch}
        />
      </div>
      {/*使用自定义的类名, 让搜索框和图表列表保持距离*/}
      <div className="margin-16" />

      <List
        itemLayout="vertical"
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          // 页码或 pageSize 改变的回调，参数是改变后的页码及每页条数（相当于每次点击新的页码，就会跳转，然后这两个参数都是最新的
          onChange: (page, pageSize) => {
            console.log(page);
            setSearchParams({
              // 还是用原来的searchPage对象属性，
              ...searchParams,
              // 但是我们要单独改变两个属性，current当前页，和每页记录数pageSize
              current: page,
              pageSize,
            });
          },
          // 当前页
          current: searchParams.current,
          // 每页条数
          pageSize: searchParams.pageSize,
          // 总条数加上，要不然还是不会分页
          total: total,
        }}
        // 列表 加载属性：
        loading-={loading}
        dataSource={chartList}
        renderItem={(item) => (
          // 每个列表项
          <List.Item key={item.id}>
            <Card style={{ width: '100%' }}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                title={item.name}
                description={item.chartType ? '图表类型：' + item.chartType : undefined}
              />
              <>
                {item.status === 'wait' && (
                  <>
                    <Result
                      status="warning"
                      title="待生成"
                      subTitle={item.execMessage ?? '当前图表生成队列繁忙，请耐心等候'}
                    />
                  </>
                )}
                {item.status === 'running' && (
                  <>
                    <Result status="info" title="图表生成中" subTitle={item.execMessage} />
                  </>
                )}
                {item.status === 'succeed' && (
                  <>
                    <div style={{ marginBottom: 16 }} />
                    <p>{'分析目标：' + item.goal}</p>
                    <div style={{ marginBottom: 16 }} />
                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)} />
                  </>
                )}
                {item.status === 'failed' && (
                  <>
                    <Result status="error" title="图表生成失败" subTitle={item.execMessage} />
                  </>
                )}
              </>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
