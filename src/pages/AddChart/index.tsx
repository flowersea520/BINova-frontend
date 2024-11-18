import { genChartByAiUsingPost } from '@/services/BiNova/chartController';
import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Upload,
  message,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';
// 这个命名就是 页面的名称
/**
 *  添加图表页面
 * @constructor
 */
const AddChart: React.FC = () => {
  // 可以理解为，他是定义了一个变量用来存储对象的吗，然后一个set变量用来获取
  // <API.BiResponse>是用来存储响应的类型
  const [chart, setChart] = useState<API.BiResponse>();
  // 加载按钮的 值存储
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [option, setOption] = useState<any>();

  /**
   *  提交表单，到后端（包括文件，文件一定要取文件file对象：values.file.file.originFileObj）好好看控制台
   * @param values
   */
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setChart(undefined);
    setOption(undefined);

    // 我们做一个前端的调试，输出values.file看看什么东西
    console.log(values.file.file.originFileObj);
    // todo 对接后端， 上传数据
    console.log('表单内容: ', values);
    // 我们这个 values里面有file属性，我们将其的file属性弄成undefined，
    // 相当于清空了 file 属性的值。这种操作通常用于将某个属性重置为空值或清除掉。
    const params = {
      // ... 其实就是一个对象属性的拷贝了
      ...values,
      file: undefined,
    };
    try {
      const res = await genChartByAiUsingPost(params, {}, values.file.file.originFileObj);
      console.log('后端响应结果为：' + res.data);

      if (!res.data) {
        message.error('分析失败');
      } else {
        message.success('分析成功');
        // 将后端响应的图表代码option（json字符串），解析成js对象
        const chartOption = JSON.parse(res.data.genChart ?? '');
        if (!chartOption) {
          throw new Error('图表代码解析错误');
        } else {
          // 后端有相应之后，将相应的data，存储到我们的setChart变量里面，然后我们的chart就有值了
          setChart(res.data);
          // 将图表代码 存到set当中
          setOption(chartOption);
        }
      }
    } catch (e: any) {
      message.error('分析失败：' + e.message);
    }
    setSubmitting(false);
  };

  return (
    // 前端表单里面的name；对应着 后端dto的属性字段，一定要一一对应
    <div className="add-chart">
      {/*我们在一行中分成两列*/}
      <Row gutter={24}>
        <Col span={12}>
          <Card title="智能分析">
            <Form name="addChart" onFinish={onFinish} initialValues={{}} style={{ maxWidth: 600 }}>
              <Form.Item
                name="goal"
                label="分析目标"
                rules={[{ required: true, message: '请输入分析目标' }]}
              >
                <TextArea placeholder="请输入你的分析需求，比如：分析网站用户的增长情况" />
              </Form.Item>

              <Form.Item name="name" label="图表名称">
                <Input placeholder="请输入图表名称" />
              </Form.Item>

              <Form.Item name="chartType" label="图表类型">
                <Select
                  options={[
                    { value: '折线图', label: '折线图' },
                    { value: '柱状图', label: '柱状图' },
                    { value: '堆叠图', label: '堆叠图' },
                    { value: '饼图', label: '饼图' },
                    { value: '雷达图', label: '雷达图' },
                  ]}
                />
              </Form.Item>
              {/*将前端表单中的name=file文件映射到我们的MultipartFile对象上， 因为加了@RequestPart(file)注解）*/}
              <Form.Item name="file" label="原始数据">
                {/*前端表单中的 action 属性通常用于指定表单提交的目标地址，
          即指定将表单数据提交到哪个后端接口处理。当用户提交表单时，
          浏览器会将表单数据发送到 action 属性指定的后端接口的URL。*/}
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined />}>上传csv文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    disabled={submitting}
                  >
                    提交
                  </Button>
                  <Button htmlType="reset">reset</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title={'分析结论'}>
            {/*  将ai生成的结论和图表放到这里*/}
            {chart?.genResult ?? <div>请现在左侧进行提交</div>}
            <Spin spinning={submitting} />
          </Card>
          <Divider />
          <Card title={'可视化图表'}>
            {
              // chart?.genChart 存在，才去渲染
              // 注意：我们genChart后端是生成的 Json字符串，我们将将其解析为js对象
              option ? <ReactECharts option={option} /> : <div> 请现在左侧进行提交 </div>
            }
            <Spin spinning={submitting} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default AddChart;
