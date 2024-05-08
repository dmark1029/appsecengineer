<template>
  <q-card class="bg-primary q-pa-md">
    <label class="text-h6 text-weight-regular text-center">{{ title }}</label>
    <q-card-section class="chart_size_baaa">
      <div ref="barChart" autoresize id="barChart" style="width: 100%; height: 450px"></div>
      <div v-if="barChartData.length === 0" class="text-center" style="padding-top: 20%; padding-bottom: 20%">
        <p class="text-h4 text-weight-bold ase-roboto ase-black-light padding_12 text-center">No Data</p>
      </div>
    </q-card-section>
    <q-resize-observer @resize="onResize" />
  </q-card>
</template>

<style>
.chart_size_baaa {
  top: 0;
  width: 100%;
  height: 450px;
}
</style>

<script>
import * as echarts from 'echarts'
export default {
  name: 'E-BarChart',
  props: {
    barChartCategories: {
      type: Array,
      required: false
    },
    barChartData: {
      type: Array,
      required: true
    },
    bar_chart_labels: {
      required: false
    },
    barChartName: {
      type: String,
      required: false
    },
    title: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      model: false,
      BarChart: {
        backgroundColor: '#111111',
        grid: {
          show: false
        },
        color: [
          '#246590',
          '#5AB049',
          '#F5B041',
          '#45B39D',
          '#f08a5d',
          '#FF5733',
          '#6f4a8e',
          '#3282b8',
          '#00c698',
          '#0097A7',
          '#CC6699',
          '#9CCC65',
          '#FFB300',
          '#DCE775',
          '#5C6BC0',
          '#99CCFF',
          '#00ACC1',
          '#9575CD',
          '#D9B277',
          '#CACAC3',
          '#2B3766',
          '#BA674B',
          '#C9352B',
          '#8639A7',
          '#ad8528',
          '#7593C9',
          '#9de3b6',
          '#1B1B53',
          '#8787e0',
          '#bf8673',
          '#c266c4',
          '#CC9E76',
          '#C7A876',
          '#EFC5AB',
          '#90348A',
          '#164E80'
        ],
        legend: {
          left: 'center',
          type: 'scroll',
          z: 2,
          orient: 'horizontal',
          right: 10,
          bottom: 5,
          data: this.bar_chart_labels,
          textStyle: {
            color: '#242424',
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return `Name: ${
              params.data.name.length < 35 ? params.data.name : params.data.name.substring(0, 35) + ' ... '
            } <br/> <div align="left">Enrollments: ${params.value}</div>`
          },
          showDelay: 40,
          transitionDuration: 1.2,
          textStyle: {
            fontSize: 12,
            lineHeight: 18
          }
        },
        xAxis: {
          axisLabel: {
            show: true,
            inside: false,
            left: 'center',
            fontSize: 10,
            borderWidth: 20,
            overflow: 'truncate',
            ellipsis: '...',
            lineOverflow: 'none',
            splitLine: {
              lineStyle: {
                type: 'dashed',
                shadowBlur: 0.5
              }
            },
            axisPointer: {
              show: false,
              type: 'shadow',
              lineStyle: {
                color: '#ffffff',
                type: 'dotted'
              }
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          type: 'category',
          data: this.barChartCategories
        },
        yAxis: {
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            inside: false,
            left: 'center',
            fontSize: 8,
            borderWidth: 1,
            overflow: 'truncate',
            ellipsis: '...',
            lineOverflow: 'none',
            splitLine: {
              show: false,
              lineStyle: {
                type: 'dashed'
              }
            },
            axisPointer: {
              show: false,
              type: 'shadow',
              lineStyle: {
                color: '#ffffff',
                type: 'dotted'
              }
            }
          },
          type: 'value'
        },
        series: [
          {
            data: this.barChartData,
            type: 'bar',
            animation: false
          }
        ]
      },
      bar_chart: null
    }
  },
  mounted() {
    this.init()
  },
  watch: {
    barChartData: {
      handler() {
        if (this.barChartData.length > 0) {
          this.BarChart = {
            backgroundColor: '#111111',
            grid: {
              show: false
            },
            color: [
              '#246590',
              '#5AB049',
              '#F5B041',
              '#45B39D',
              '#f08a5d',
              '#FF5733',
              '#6f4a8e',
              '#3282b8',
              '#00c698',
              '#0097A7',
              '#CC6699',
              '#9CCC65',
              '#FFB300',
              '#DCE775',
              '#5C6BC0',
              '#99CCFF',
              '#00ACC1',
              '#9575CD',
              '#D9B277',
              '#CACAC3',
              '#2B3766',
              '#BA674B',
              '#C9352B',
              '#8639A7',
              '#ad8528',
              '#7593C9',
              '#9de3b6',
              '#1B1B53',
              '#8787e0',
              '#bf8673',
              '#c266c4',
              '#CC9E76',
              '#C7A876',
              '#EFC5AB',
              '#90348A',
              '#164E80'
            ],
            legend: {
              left: 'center',
              type: 'scroll',
              z: 2,
              orient: 'horizontal',
              right: 10,
              bottom: 5,
              data: this.bar_chart_labels,
              textStyle: {
                color: '#242424',
                fontSize: 12
              }
            },
            tooltip: {
              trigger: 'item',
              formatter: function (params) {
                return `Name: ${
                  params.data.name.length < 35 ? params.data.name : params.data.name.substring(0, 35) + ' ... '
                } <br/> <div align="left">Enrollments: ${params.value}</div>`
              },
              showDelay: 40,
              transitionDuration: 1.2,
              textStyle: {
                fontSize: 12,
                lineHeight: 18
              }
            },
            xAxis: {
              axisLabel: {
                show: true,
                inside: false,
                left: 'center',
                fontSize: 10,
                borderWidth: 20,
                overflow: 'truncate',
                ellipsis: '...',
                lineOverflow: 'none',
                splitLine: {
                  lineStyle: {
                    type: 'dashed',
                    shadowBlur: 0.5
                  }
                },
                axisPointer: {
                  show: false,
                  type: 'shadow',
                  lineStyle: {
                    color: '#ffffff',
                    type: 'dotted'
                  }
                }
              },
              axisTick: {
                show: false
              },
              axisLine: {
                show: false
              },
              type: 'category',
              data: this.barChartCategories
            },
            yAxis: {
              axisLine: {
                show: false
              },
              axisTick: {
                show: true
              },
              axisLabel: {
                show: true,
                inside: false,
                left: 'center',
                fontSize: 8,
                borderWidth: 1,
                overflow: 'truncate',
                ellipsis: '...',
                lineOverflow: 'none',
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: 'dashed'
                  }
                },
                axisPointer: {
                  show: false,
                  type: 'shadow',
                  lineStyle: {
                    color: '#ffffff',
                    type: 'dotted'
                  }
                }
              },
              type: 'value'
            },
            series: [
              {
                data: this.barChartData,
                type: 'bar',
                animation: false
              }
            ]
          }
        }
        this.init()
      }
    }
  },
  methods: {
    SaveImage() {
      const linkSource = this.bar_chart.getDataURL()
      const downloadLink = document.createElement('a')
      document.body.appendChild(downloadLink)
      downloadLink.href = linkSource
      downloadLink.target = '_self'
      downloadLink.download = 'BarChart.png'
      downloadLink.click()
    },
    init() {
      const barChart = document.getElementById('barChart')
      echarts.dispose(barChart)
      const theme = this.model ? 'dark' : 'light'
      this.bar_chart = echarts.init(barChart, theme)
      this.bar_chart.setOption(this.BarChart)
    },
    toggleTheme() {
      if (this.model) {
        this.model = false
        this.init()
      } else {
        this.model = true
        this.init()
      }
    },
    onResize() {
      if (this.bar_chart) {
        this.bar_chart.resize()
      }
    }
  }
}
</script>
