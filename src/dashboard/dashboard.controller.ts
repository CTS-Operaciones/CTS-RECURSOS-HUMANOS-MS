import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { DashboardService } from "./dashboard.service";
import { FilterDashboardDto } from "./dto";

@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }
  
  @MessagePattern('get-dashboard-data')
  async getDashboardData(@Payload() filterDashboardDto: FilterDashboardDto) {
    return this.dashboardService.getDashboardData(filterDashboardDto);
  }
}