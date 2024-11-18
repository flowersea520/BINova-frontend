import { genChartByAiAsyncMqUsingPost } from '@/services/BiNova/chartController';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Upload, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';
// 这个命名就是 页面的名称
/**
 *  添加图表（异步)页面
 * @constructor
 */
const AddChartAsync: React.FC = () => {
  // 加载按钮的 值存储
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form] = useForm();

  /**
   *  提交表单，到后端（包括文件，文件一定要取文件file对象：values.file.file.originFileObj）好好看控制台
   * @param values
   */
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) {
      return;
    }

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
      const res = await genChartByAiAsyncMqUsingPost(params, {}, values.file.file.originFileObj);
      console.log('后端响应结果为：' + res.data);

      if (!res?.data) {
        message.error('分析失败');
      } else {
        // 因为他是异步任务，所以响应成功之后，要等待ai生成图表，在生成的过程中，让用户稍后查看
        message.success('分析任务提交成功，稍后请在我的图表页面查看');
        // 重置form表单项
        form.resetFields();
      }
    } catch (e: any) {
      message.error('分析失败：' + e.message);
    }
    setSubmitting(false);
  };

  return (
    // 前端表单里面的name；对应着 后端dto的属性字段，一定要一一对应
    <div className="add-chart-async">
      <Card title="智能分析">
        <Form
          form={form}
          name="addChart"
          onFinish={onFinish}
          initialValues={{}}
          style={{ maxWidth: 600 }}
        >
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
              <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                提交
              </Button>
              <Button htmlType="reset">reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
export default AddChartAsync;
